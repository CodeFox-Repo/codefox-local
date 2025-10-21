import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
// import { spawn } from "child_process";
// import { ProjectManager } from "@/lib/project-manager";
import {
  defineClientSideTool,
  writeFileSchema,
  executeCommandSchema,
  attemptCompletionSchema,
} from "@/lib/tool-definitions";
import { createSystemPrompt } from "@/lib/prompts";

// const projectManager = ProjectManager.getInstance();

// Create OpenRouter client
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});


export async function POST(req: Request) {
  try {
    const { messages, projectId, files, fileInstruction } = await req.json();
    console.log('files', files);
    console.log('fileInstruction', fileInstruction);

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

    // Helper function to extract URL from dev server output (unused for now)
    // const extractUrl = (output: string): string | null => {
    //   const patterns = [
    //     /Local:\s+(https?:\/\/[^\s]+)/,           // Vite
    //     /url:\s+(https?:\/\/[^\s]+)/,             // Next.js
    //     /(https?:\/\/localhost:\d+)/,             // Generic
    //   ];

    //   for (const pattern of patterns) {
    //     const match = output.match(pattern);
    //     if (match) return match[1].replace(/\/$/, ''); // Remove trailing slash
    //   }

    //   return null;
    // };

    // Tools are now client-side only (handled by Sandpack)
    // Server-side tools are disabled but definitions remain for compatibility
    const tools = {
      // Client-side tools only - all file operations happen in Sandpack
      writeFile: defineClientSideTool({
        description: "Write content to a file in the project. Creates directories if needed.",
        inputSchema: writeFileSchema,
      }),
      executeCommand: defineClientSideTool({
        description: "Execute a shell command in the project directory.",
        inputSchema: executeCommandSchema,
      }),
      attemptCompletion: defineClientSideTool({
        description: "Mark the task as complete and provide a summary of what was accomplished. Use this when you have finished implementing the user's request.",
        inputSchema: attemptCompletionSchema,
      }),
    };

    // Create system prompt with file structure and organization instructions
    const systemPrompt = createSystemPrompt({
      files,
      fileInstruction
    });

    // Stream the response with tools
    const result = streamText({
      model: openrouter.chat(
        process.env.NEXT_PUBLIC_DEFAULT_MODEL || "anthropic/claude-sonnet-4.5"
      ),
      messages: modelMessages,
      system: systemPrompt,
      tools,
      temperature: 0.7,
      maxOutputTokens: 16384,
      stopWhen: stepCountIs(100),
      onStepFinish: (step) => {
        console.log('[StreamText] Step finished:', step);
      },
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
