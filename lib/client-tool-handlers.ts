import { useProjectStore } from './store';

/**
 * Generic tool call structure (compatible with AI SDK types)
 */
type ToolCall = {
  toolCallId: string;
  toolName: string;
  input: unknown;
  dynamic?: boolean;
};

/**
 * Tool result structure for addToolResult
 */
type ToolResult =
  | {
      state?: 'output-available';
      tool: string;
      toolCallId: string;
      output: unknown;
      errorText?: never;
    }
  | {
      state: 'output-error';
      tool: string;
      toolCallId: string;
      output?: never;
      errorText: string;
    };

/**
 * Client-side tool handler parameters
 */
interface ClientToolHandlerParams {
  toolCall: ToolCall;
  addToolResult: (result: ToolResult) => void;
}

/**
 * Client-side tool handler type
 */
type ClientToolHandler = (params: ClientToolHandlerParams) => Promise<void>;

/**
 * Handler for writeFile tool
 */
const handleWriteFile: ClientToolHandler = async ({ toolCall, addToolResult }) => {
  try {
    const input = toolCall.input as { path: string; content: string };
    const sandpackAPI = useProjectStore.getState().sandpackAPI;

    if (!sandpackAPI) {
      addToolResult({
        tool: 'writeFile',
        toolCallId: toolCall.toolCallId,
        state: 'output-error',
        errorText: 'Sandpack not initialized',
      });
      return;
    }

    const result = await sandpackAPI.writeFile(input.path, input.content);

    if (result.success) {
      addToolResult({
        tool: 'writeFile',
        toolCallId: toolCall.toolCallId,
        output: { success: true, message: `File written: ${input.path}` },
      });
    } else {
      addToolResult({
        tool: 'writeFile',
        toolCallId: toolCall.toolCallId,
        state: 'output-error',
        errorText: result.error || 'Failed to write file',
      });
    }
  } catch (err) {
    addToolResult({
      tool: 'writeFile',
      toolCallId: toolCall.toolCallId,
      state: 'output-error',
      errorText: err instanceof Error ? err.message : 'Failed to write file',
    });
  }
};

/**
 * Handler for executeCommand tool
 */
const handleExecuteCommand: ClientToolHandler = async ({ toolCall, addToolResult }) => {
  try {
    const input = toolCall.input as { command: string };
    const sandpackAPI = useProjectStore.getState().sandpackAPI;

    if (!sandpackAPI) {
      addToolResult({
        tool: 'executeCommand',
        toolCallId: toolCall.toolCallId,
        state: 'output-error',
        errorText: 'Sandpack not initialized',
      });
      return;
    }

    const result = await sandpackAPI.executeCommand(input.command);

    addToolResult({
      tool: 'executeCommand',
      toolCallId: toolCall.toolCallId,
      output: { 
        success: result.success, 
        message: result.message || 'Command executed (no-op in Sandpack)' 
      },
    });
  } catch (err) {
    addToolResult({
      tool: 'executeCommand',
      toolCallId: toolCall.toolCallId,
      state: 'output-error',
      errorText: err instanceof Error ? err.message : 'Failed to execute command',
    });
  }
};

/**
 * Map of client-side tool names to their handlers
 */
const clientToolHandlers: Record<string, ClientToolHandler> = {
  writeFile: handleWriteFile,
  executeCommand: handleExecuteCommand,
};

/**
 * Main handler for client-side tools
 * Returns true if handled, false if should continue (server-side tool)
 *
 * Uses generic types to be compatible with AI SDK's ToolCall type
 */
export async function clientToolCall<T extends ToolCall>(params: {
  toolCall: T;
  addToolResult: (result: ToolResult) => void;
}): Promise<boolean> {
  const { toolCall } = params;

  // Check if it's a dynamic tool (server-side)
  if (toolCall.dynamic) {
    return false;
  }

  // Check if we have a handler for this tool
  const handler = clientToolHandlers[toolCall.toolName];

  if (!handler) {
    return false;
  }

  // Execute the handler
  await handler(params);
  return true;
}
