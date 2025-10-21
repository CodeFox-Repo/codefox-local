import { defineClientSideTool, writeFileSchema, attemptCompletionSchema } from "@/lib/tool-definitions";

/**
 * Client-side tool definitions
 * These tools are executed on the client side and passed to the backend API
 */
export const clientSideTools = {
  writeFile: defineClientSideTool({
    description: "Write or update content to a file in the project. Creates directories if needed.",
    inputSchema: writeFileSchema,
  }),
  attemptCompletion: defineClientSideTool({
    description: "Mark the task as complete and provide a summary of what was accomplished. Use this when you have finished implementing the user's request.",
    inputSchema: attemptCompletionSchema,
  }),
};

/**
 * Type for client-side tools
 */
export type ClientSideTools = typeof clientSideTools;
