import { z } from "zod";

// ============================================================================
// Schema Definitions
// ============================================================================

export const writeFileSchema = z.object({
  path: z.string().describe("File path relative to project root"),
  content: z.string().describe("File content to write"),
});

export const executeCommandSchema = z.object({
  command: z.string().describe("Shell command to execute"),
  keepAlive: z.boolean().optional().describe("Keep process running in background (for dev servers)"),
});

export const setPreviewUrlSchema = z.object({
  url: z.string().describe("Preview URL (e.g., http://localhost:5173)"),
});

export const tryStartDevServerSchema = z.object({
  reason: z.string().optional().describe("Reason for starting the dev server (optional)"),
});

// ============================================================================
// Output Schemas
// ============================================================================

export const writeFileOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export const executeCommandOutputSchema = z.object({
  success: z.boolean(),
  stdout: z.string().optional(),
  stderr: z.string().optional(),
  previewUrl: z.string().optional(),
  pid: z.number().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export const setPreviewUrlOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const tryStartDevServerOutputSchema = z.object({
  success: z.boolean(),
  url: z.string().optional(),
  pid: z.number().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type WriteFileInput = z.infer<typeof writeFileSchema>;
export type WriteFileOutput = z.infer<typeof writeFileOutputSchema>;

export type ExecuteCommandInput = z.infer<typeof executeCommandSchema>;
export type ExecuteCommandOutput = z.infer<typeof executeCommandOutputSchema>;

export type SetPreviewUrlInput = z.infer<typeof setPreviewUrlSchema>;
export type SetPreviewUrlOutput = z.infer<typeof setPreviewUrlOutputSchema>;

export type TryStartDevServerInput = z.infer<typeof tryStartDevServerSchema>;
export type TryStartDevServerOutput = z.infer<typeof tryStartDevServerOutputSchema>;

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
// Tool Definitions (for reference, actual tools created in route.ts)
// ============================================================================

export const TOOL_DEFINITIONS = {
  writeFile: {
    description: "Write content to a file in the project. Creates new files or overwrites existing ones.",
    inputSchema: writeFileSchema,
    outputSchema: writeFileOutputSchema,
  },
  executeCommand: {
    description: "Execute a shell command in the project directory. For dev servers (npm run dev), use keepAlive=true to run in background.",
    inputSchema: executeCommandSchema,
    outputSchema: executeCommandOutputSchema,
  },
  setPreviewUrl: {
    description: "Update the preview iframe URL. This is a client-side tool that will be handled by the frontend.",
    inputSchema: setPreviewUrlSchema,
    outputSchema: setPreviewUrlOutputSchema,
  },
} as const;
