import { useProjectStore } from './store';
import { setPreviewUrl } from './client-tools';

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
 * Handler for setPreviewUrl tool (deprecated)
 */
const handleSetPreviewUrl: ClientToolHandler = async ({ toolCall, addToolResult }) => {
  try {
    const input = toolCall.input as { url: string };
    await setPreviewUrl(input.url);

    addToolResult({
      tool: 'setPreviewUrl',
      toolCallId: toolCall.toolCallId,
      output: { success: true, message: `Preview updated to ${input.url}` },
    });
  } catch (err) {
    addToolResult({
      tool: 'setPreviewUrl',
      toolCallId: toolCall.toolCallId,
      state: 'output-error',
      errorText: err instanceof Error ? err.message : 'Failed to update preview',
    });
  }
};

/**
 * Handler for tryStartDevServer tool
 */
const handleTryStartDevServer: ClientToolHandler = async ({ toolCall, addToolResult }) => {
  // Get fresh project ID from store (not from component closure)
  const currentProjId = useProjectStore.getState().currentProjectId;
  const setDevServer = useProjectStore.getState().setDevServer;
  const setDevServerStatus = useProjectStore.getState().setDevServerStatus;

  try {
    if (!currentProjId) {
      console.error('[tryStartDevServer] No project selected');
      addToolResult({
        tool: 'tryStartDevServer',
        toolCallId: toolCall.toolCallId,
        state: 'output-error',
        errorText: 'No project selected',
      });
      return;
    }

    setDevServerStatus('starting');

    // Check if already running first
    const statusResponse = await fetch(`/api/dev-server?projectId=${currentProjId}`);
    const statusData = await statusResponse.json();

    if (statusData.status === 'running') {
      addToolResult({
        tool: 'tryStartDevServer',
        toolCallId: toolCall.toolCallId,
        output: {
          success: true,
          url: statusData.url,
          pid: statusData.pid,
          message: 'Dev server already running',
        },
      });
      return;
    }

    // Start dev server via API
    const response = await fetch('/api/dev-server', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId: currentProjId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[tryStartDevServer] Failed to start dev server:', errorText);
      setDevServerStatus('error');
      addToolResult({
        tool: 'tryStartDevServer',
        toolCallId: toolCall.toolCallId,
        state: 'output-error',
        errorText: `Failed to start dev server: ${errorText}`,
      });
      return;
    }

    const data = await response.json();

    if (data.url && data.pid) {
      setDevServer(currentProjId, data.url, data.pid);
      addToolResult({
        tool: 'tryStartDevServer',
        toolCallId: toolCall.toolCallId,
        output: {
          success: true,
          url: data.url,
          pid: data.pid,
          message: data.cached ? 'Dev server was already running' : 'Dev server started successfully',
        },
      });
    } else {
      console.error('[tryStartDevServer] No URL or PID in response');
      setDevServerStatus('idle');
      addToolResult({
        tool: 'tryStartDevServer',
        toolCallId: toolCall.toolCallId,
        state: 'output-error',
        errorText: 'Failed to get dev server URL',
      });
    }
  } catch (err) {
    console.error('[tryStartDevServer] Error:', err);
    setDevServerStatus('error');
    addToolResult({
      tool: 'tryStartDevServer',
      toolCallId: toolCall.toolCallId,
      state: 'output-error',
      errorText: err instanceof Error ? err.message : 'Failed to start dev server',
    });
  }
};

/**
 * Map of client-side tool names to their handlers
 */
const clientToolHandlers: Record<string, ClientToolHandler> = {
  setPreviewUrl: handleSetPreviewUrl,
  tryStartDevServer: handleTryStartDevServer,
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
