import { z } from "zod";

// ============================================================================
// Schema Definitions
// ============================================================================

export const writeFileSchema = z.object({
  path: z.string().describe("File path relative to project root"),
  content: z.string().describe("File content to write"),
});

export const attemptCompletionSchema = z.object({
  summary: z.string().describe("Brief summary of what was accomplished"),
});

// ============================================================================
// Output Schemas
// ============================================================================

export const writeFileOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export const attemptCompletionOutputSchema = z.object({
  summary: z.string(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type WriteFileInput = z.infer<typeof writeFileSchema>;
export type WriteFileOutput = z.infer<typeof writeFileOutputSchema>;

export type AttemptCompletionInput = z.infer<typeof attemptCompletionSchema>;
export type AttemptCompletionOutput = z.infer<typeof attemptCompletionOutputSchema>;

// ============================================================================
// Tool Definition Helpers
// ============================================================================

/**
 * Helper to define a server-side tool with execute function
 */
export function defineServerSideTool<TInput, TOutput>(config: {
  description: string;
  inputSchema: z.ZodType<TInput>;
  outputSchema?: z.ZodType<TOutput>;
  execute: (input: TInput) => Promise<TOutput>;
}) {
  return {
    description: config.description,
    inputSchema: config.inputSchema,
    outputSchema: config.outputSchema,
    execute: async (input: TInput) => {
      return await config.execute(input);
    },
  };
}

/**
 * Helper to define a client-side tool without execute function
 */
export function defineClientSideTool<TInput>(config: {
  description: string;
  inputSchema: z.ZodType<TInput>;
}) {
  return {
    description: config.description,
    inputSchema: config.inputSchema,
  };
}

// ============================================================================
// Tool Definitions
// ============================================================================

export const TOOL_DEFINITIONS = {
  writeFile: {
    description: "Write content to a file in the project. Creates new files or overwrites existing ones.",
    inputSchema: writeFileSchema,
    outputSchema: writeFileOutputSchema,
  },
  attemptCompletion: {
    description: "Mark the task as complete and provide a summary of what was accomplished. Use this when you have finished implementing the user's request.",
    inputSchema: attemptCompletionSchema,
    outputSchema: attemptCompletionOutputSchema,
  },
} as const;
