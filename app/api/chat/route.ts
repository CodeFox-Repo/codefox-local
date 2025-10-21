import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createSystemPrompt } from "@/lib/prompts";
import { clientSideTools } from "@/lib/client-tools-definitions";

// const projectManager = ProjectManager.getInstance();

// Create OpenRouter client
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});


export async function POST(req: Request) {
  try {
    const { messages, projectId, files, fileContents, fileInstruction } = await req.json();
    console.log('files', files);
    console.log('fileContents', fileContents ? Object.keys(fileContents) : 'none');
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
