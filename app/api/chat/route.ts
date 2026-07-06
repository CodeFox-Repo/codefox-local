import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createSystemPrompt } from "@/lib/prompts";
import { clientSideTools } from "@/lib/client-tools-definitions";
import { resolveEngine } from "@/lib/engine/resolve";
import { streamHarnessTurn } from "@/lib/engine/harness";
import { ProjectManager } from "@/lib/project-manager";

// The harness bridge spawns a local child process — this route must run in
// the Node.js runtime, never edge.
export const runtime = "nodejs";

// OpenRouter speaks the OpenAI chat-completions API; @ai-sdk/openai is the
// ai@7-compatible client for it (@openrouter/ai-sdk-provider peers ai@6).
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

/** Resolve the on-disk project directory for a projectId. */
function resolveProjectDir(projectId: string): string | null {
  const known = ProjectManager.getInstance().getProject(projectId)?.path;
  if (known) return known;
  // ProjectManager state is in-memory; fall back to the on-disk layout.
  const fallback = path.join(os.homedir(), ".codefox-local", "projects", projectId);
  return existsSync(fallback) ? fallback : null;
}

/** Newest user message text — the harness session is stateful, it only needs the latest turn. */
function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;
    return message.parts
      .filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
      .map((part) => part.text)
      .join("\n");
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const { messages, projectId, files, fileContents, fileInstruction } = await req.json();

    // Validate project ID
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: "Project ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const engine = resolveEngine();

    if (engine === "claude" || engine === "codex") {
      const projectDir = resolveProjectDir(projectId);
      if (!projectDir) {
        return new Response(
          JSON.stringify({ error: `Project ${projectId} not found on disk` }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      const prompt = lastUserText(messages);
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "No user message to send" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      // The harness runtime owns its own coding tools and works on the
      // project directory directly — no client-side tools, no file snapshot.
      return await streamHarnessTurn({ vendor: engine, projectDir, prompt });
    }

    // OpenRouter path
    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert UIMessages to ModelMessages
    const modelMessages = await convertToModelMessages(messages);

    // Create system prompt with file contents and organization instructions
    const systemPrompt = createSystemPrompt({
      files,
      fileContents,
      fileInstruction
    });

    // Stream the response with tools
    const result = streamText({
      model: openrouter.chat(
        process.env.NEXT_PUBLIC_DEFAULT_MODEL || "anthropic/claude-sonnet-4.5"
      ),
      messages: modelMessages,
      system: systemPrompt,
      tools: clientSideTools,
      temperature: 0.7,
      maxOutputTokens: 16384,
      stopWhen: stepCountIs(100),
    });

    // Return UIMessage stream response
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
