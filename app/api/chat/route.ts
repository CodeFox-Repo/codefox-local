import { streamText, convertToModelMessages } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { ProjectManager } from "@/lib/project-manager";

const projectManager = ProjectManager.getInstance();

// Create OpenRouter client
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are an expert full-stack web developer who helps users create modern web applications.

Your role is to build complete, production-ready projects using the provided template.

Guidelines:
- Use modern best practices (TypeScript, React, Next.js, Tailwind CSS)
- Write clean, maintainable code
- Add proper error handling
- Include helpful comments
- Explain what you're doing step by step

Use the available tools to make real changes to the project!`;

export async function POST(req: Request) {
  try {
    const { messages, projectId } = await req.json();

    // Validate API key
    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate project ID
    if (!projectId) {
      return new Response(
        JSON.stringify({ error: "Project ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert UIMessages to ModelMessages
    const modelMessages = convertToModelMessages(messages);

    // TODO: When moving to remote/cloud deployment, these tools should be proxied
    // to a VM sandbox environment for security and isolation. The right panel
    // should connect to the sandbox's dev server instead of localhost.
    //
    // Architecture for remote deployment:
    // 1. User request → Chat API
    // 2. Chat API → VM Sandbox Proxy
    // 3. VM Sandbox executes tools (writeFile, executeCommand)
    // 4. Right panel iframe → VM Sandbox dev server (e.g., https://sandbox-{id}.example.com)
    //
    // For now, these tools execute on the local server where the app is running.
    const tools = {
      writeFile: {
        description: "Write content to a file in the project. Creates directories if needed.",
        inputSchema: z.object({
          filePath: z.string().describe("Path to the file (relative to project root)"),
          content: z.string().describe("Content to write to the file"),
        }),
        execute: async ({ filePath, content }: { filePath: string; content: string }) => {
          try {
            await projectManager.writeFile(projectId, filePath, content);
            return {
              success: true,
              message: `File ${filePath} written successfully`,
            };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      },
      executeCommand: {
        description: "Execute a shell command in the project directory (bun install, npm install, etc.)",
        inputSchema: z.object({
          command: z.string().describe("Shell command to execute"),
        }),
        execute: async ({ command }: { command: string }) => {
          try {
            const result = await projectManager.executeCommand(projectId, command);
            return {
              success: true,
              stdout: result.stdout,
              stderr: result.stderr,
            };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      },
    };

    // Stream the response with tools
    const result = streamText({
      model: openrouter.chat(
        process.env.NEXT_PUBLIC_DEFAULT_MODEL || "anthropic/claude-sonnet-4.5"
      ),
      messages: modelMessages,
      system: SYSTEM_PROMPT,
      tools,
      temperature: 0.7,
    });

    // Return UIMessage stream response (AI SDK v5)
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
