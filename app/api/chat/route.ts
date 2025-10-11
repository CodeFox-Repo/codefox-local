import { streamText, convertToModelMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// Create OpenRouter client
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
});

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a helpful AI assistant with a special ability to help users browse and view websites.

Special Capabilities:
1. When a user asks to open or view a website, you can use a special marker format in your response:
   [OPEN_URL:https://example.com]

2. This marker will be automatically parsed by the frontend and open the URL in the iframe viewer on the right side.

3. Examples:
   - User: "Open Google"
   - You: "Sure, I'll open Google for you. [OPEN_URL:https://www.google.com]"

   - User: "Show me GitHub"
   - You: "Opening GitHub... [OPEN_URL:https://github.com]"

4. You can open any valid URL. Always use https:// protocol.

5. After opening a URL, you can discuss the website, explain features, or answer questions about it.

Please be helpful, conversational, and use the URL opening feature naturally when appropriate.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate API key
    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenRouter API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert UIMessages to ModelMessages
    const modelMessages = convertToModelMessages(messages);

    // Stream the response
    const result = streamText({
      model: openrouter(
        process.env.NEXT_PUBLIC_DEFAULT_MODEL || "anthropic/claude-3.5-sonnet"
      ),
      messages: modelMessages,
      system: SYSTEM_PROMPT,
      temperature: 0.7,
      maxTokens: 4096,
    });

    // Return UIMessage stream response (AI SDK v5)
    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
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
