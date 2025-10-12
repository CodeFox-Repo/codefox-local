import { Terminal, FileText, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  WriteFileInput,
  WriteFileOutput,
  ExecuteCommandInput,
  ExecuteCommandOutput,
  SetPreviewUrlInput,
  SetPreviewUrlOutput,
} from "@/lib/tool-definitions";

interface ToolCallProps {
  toolName: string;
  input: unknown;
  output?: unknown;
  state?: "pending" | "completed" | "error";
}

export function ToolCall({ toolName, input, output, state = "pending" }: ToolCallProps) {
  // Helper to safely render unknown values as strings
  const safeString = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    if (value === null || value === undefined) return '';
    return JSON.stringify(value);
  };

  // Type guard to check if output exists
  const hasOutput = (val: unknown): val is Record<string, unknown> => {
    return val != null && typeof val === 'object';
  };

  const renderExecuteCommand = () => {
    const typedInput = (input || {}) as ExecuteCommandInput;
    const typedOutput = (output || {}) as ExecuteCommandOutput;

    // Handle case where input is not yet available (streaming state)
    if (!typedInput.command) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Executing command...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-blue-500" />
          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
            {safeString(typedInput.command)}
          </code>
          {typedInput.keepAlive && (
            <span className="text-xs text-muted-foreground">(background)</span>
          )}
        </div>

        {hasOutput(output) && (
          <div className="ml-6 space-y-1">
            {typedOutput.previewUrl && typeof typedOutput.previewUrl === 'string' && (
              <div className="text-sm text-green-600 dark:text-green-400">
                ✓ Server started: {typedOutput.previewUrl}
              </div>
            )}
            {typedOutput.stdout && typeof typedOutput.stdout === 'string' && (
              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-32">
                {typedOutput.stdout}
              </pre>
            )}
            {typedOutput.stderr && typeof typedOutput.stderr === 'string' && (
              <pre className="text-xs bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-2 rounded overflow-x-auto max-h-32">
                {typedOutput.stderr}
              </pre>
            )}
            {typedOutput.error && typeof typedOutput.error === 'string' && (
              <div className="text-sm text-red-600 dark:text-red-400">
                ✗ Error: {typedOutput.error}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderWriteFile = () => {
    const typedInput = (input || {}) as WriteFileInput;
    const typedOutput = (output || {}) as WriteFileOutput;

    // Handle case where input is not yet available (streaming state)
    if (!typedInput.content) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">Writing file...</span>
          </div>
        </div>
      );
    }

    const lines = typedInput.content.split('\n').length;
    const preview = typedInput.content.slice(0, 200);

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-purple-500" />
          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
            {safeString(typedInput.path)}
          </code>
          <span className="text-xs text-muted-foreground">
            ({lines} lines)
          </span>
        </div>

        {hasOutput(output) && typedOutput.success && (
          <div className="ml-6 text-sm text-green-600 dark:text-green-400">
            ✓ File written successfully
          </div>
        )}

        {hasOutput(output) && typedOutput.error && typeof typedOutput.error === 'string' && (
          <div className="ml-6 text-sm text-red-600 dark:text-red-400">
            ✗ Error: {typedOutput.error}
          </div>
        )}

        <details className="ml-6">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
            Show preview
          </summary>
          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-32 mt-1">
            {preview}
            {typedInput.content.length > 200 && '\n...'}
          </pre>
        </details>
      </div>
    );
  };

  const renderSetPreviewUrl = () => {
    const typedInput = (input || {}) as SetPreviewUrlInput;
    const typedOutput = (output || {}) as SetPreviewUrlOutput;

    // Handle case where input is not yet available (streaming state)
    if (!typedInput.url) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
            <span className="text-sm text-muted-foreground">Updating preview...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          <span className="text-sm">Preview updated:</span>
          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
            {safeString(typedInput.url)}
          </code>
        </div>

        {hasOutput(output) && typedOutput.success && typedOutput.message && typeof typedOutput.message === 'string' && (
          <div className="ml-6 text-sm text-green-600 dark:text-green-400">
            ✓ {typedOutput.message}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (toolName) {
      case 'executeCommand':
        return renderExecuteCommand();
      case 'writeFile':
        return renderWriteFile();
      case 'setPreviewUrl':
        return renderSetPreviewUrl();
      default:
        return (
          <div className="text-sm">
            <code className="font-mono">{toolName}</code>
            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(input, null, 2)}
            </pre>
          </div>
        );
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
  };

  return (
    <div
      className={cn(
        "border rounded-lg p-3 mb-2 transition-colors",
        state === 'completed' && "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20",
        state === 'error' && "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20",
        state === 'pending' && "border-muted bg-muted/30"
      )}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{getStateIcon()}</div>
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
