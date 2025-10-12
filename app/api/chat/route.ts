import { streamText, convertToModelMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// Create OpenRouter client
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || "",
  baseURL: "https://openrouter.ai/api/v1",
});

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are an expert web developer and designer who helps users create beautiful, functional websites.

Your primary role is to generate complete, self-contained HTML websites based on user descriptions.

Guidelines:
1. When users describe a website they want, generate complete HTML code with:
   - Modern, responsive design using Tailwind CSS (via CDN)
   - Inline styles and JavaScript when needed
   - Clean, semantic HTML structure
   - Professional and visually appealing design

2. Wrap ALL generated HTML code with special markers:
   \`\`\`html
   <!-- GENERATED_CODE_START -->
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Your Title</title>
       <script src="https://cdn.tailwindcss.com"></script>
   </head>
   <body>
       <!-- Your content here -->
   </body>
   </html>
   <!-- GENERATED_CODE_END -->
   \`\`\`

3. ALWAYS include the <!-- GENERATED_CODE_START --> and <!-- GENERATED_CODE_END --> markers
   so the code can be extracted and displayed in the preview pane.

4. Make websites interactive, beautiful, and fully functional.

5. Explain what you've created and any special features.

6. Be ready to iterate and modify the website based on user feedback.

Remember: Every HTML document you generate MUST be wrapped with the GENERATED_CODE_START/END markers!`;

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
