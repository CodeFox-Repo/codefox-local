import { streamText, convertToModelMessages } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { spawn } from "child_process";
import { ProjectManager } from "@/lib/project-manager";
import { CODEFOX_SYSTEM_PROMPT } from "@/lib/prompts";
import {
  defineServerSideTool,
  defineClientSideTool,
  writeFileSchema,
  executeCommandSchema,
  setPreviewUrlSchema,
  type WriteFileOutput,
  type ExecuteCommandOutput,
} from "@/lib/tool-definitions";

const projectManager = ProjectManager.getInstance();

// Create OpenRouter client
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});


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

    // Helper function to extract URL from dev server output
    const extractUrl = (output: string): string | null => {
      const patterns = [
        /Local:\s+(https?:\/\/[^\s]+)/,           // Vite
        /url:\s+(https?:\/\/[^\s]+)/,             // Next.js
        /(https?:\/\/localhost:\d+)/,             // Generic
      ];

      for (const pattern of patterns) {
        const match = output.match(pattern);
        if (match) return match[1].replace(/\/$/, ''); // Remove trailing slash
      }

      return null;
    };

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
      writeFile: defineServerSideTool({
        description: "Write content to a file in the project. Creates directories if needed.",
        inputSchema: writeFileSchema,
        execute: async (input): Promise<WriteFileOutput> => {
          try {
            await projectManager.writeFile(projectId, input.path, input.content);
            return {
              success: true,
              message: `File ${input.path} written successfully`,
            };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      executeCommand: defineServerSideTool({
        description: "Execute a shell command in the project directory. For dev servers (npm run dev), use keepAlive=true to run in background.",
        inputSchema: executeCommandSchema,
        execute: async (input): Promise<ExecuteCommandOutput> => {
          const { command, keepAlive = false } = input;
          try {
            if (keepAlive) {
              // Start dev server in background
              const projectPath = projectManager.getProjectPath(projectId);

              return new Promise((resolve, reject) => {
                const proc = spawn(command, {
                  cwd: projectPath,
                  shell: true,
                  detached: true,
                  stdio: ['ignore', 'pipe', 'pipe'],
                });

                let output = '';

                // Collect output
                proc.stdout?.on('data', (data: Buffer) => {
                  output += data.toString();

                  // Try to extract URL
                  const url = extractUrl(output);
                  if (url) {
                    proc.unref(); // Detach so it keeps running
                    resolve({
                      success: true,
                      stdout: output,
                      previewUrl: url,
                      pid: proc.pid,
                      message: `Dev server started at ${url}`,
                    });
                  }
                });

                proc.stderr?.on('data', (data: Buffer) => {
                  output += data.toString();

                  const url = extractUrl(output);
                  if (url) {
                    proc.unref();
                    resolve({
                      success: true,
                      stdout: output,
                      previewUrl: url,
                      pid: proc.pid,
                      message: `Dev server started at ${url}`,
                    });
                  }
                });

                proc.on('error', (error) => {
                  reject({
                    success: false,
                    error: `Failed to start: ${error.message}`,
                  });
                });

                // Timeout - commented out to allow any type of background job
                // setTimeout(() => {
                //   if (!extractUrl(output)) {
                //     proc.kill();
                //     reject({
                //       success: false,
                //       error: 'Server started but no URL found',
                //       stdout: output.substring(0, 500),
                //     });
                //   }
                // }, timeout);
              });
            } else {
              // Normal execution
              const result = await projectManager.executeCommand(projectId, command);
              return {
                success: true,
                stdout: result.stdout,
                stderr: result.stderr,
              };
            }
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        },
      }),
      // Client-side tool: setPreviewUrl (no execute function)
      setPreviewUrl: defineClientSideTool({
        description: "Update the preview iframe URL. This is a client-side tool that will be handled by the frontend.",
        inputSchema: setPreviewUrlSchema,
      }),
    };

    // Stream the response with tools
    const result = streamText({
      model: openrouter.chat(
        process.env.NEXT_PUBLIC_DEFAULT_MODEL || "anthropic/claude-sonnet-4.5"
      ),
      messages: modelMessages,
      system: CODEFOX_SYSTEM_PROMPT,
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
