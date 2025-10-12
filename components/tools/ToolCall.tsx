import { Loader2, CheckCircle2, XCircle } from "lucide-react";
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
      return <span className="text-muted-foreground">Executing command...</span>;
    }

    return (
      <div className="space-y-2">
        {/* Command input */}
        <div className="bg-muted/30 rounded px-3 py-2 border">
          <code className="text-xs font-mono">{safeString(typedInput.command)}</code>
          {typedInput.keepAlive && (
            <span className="text-xs text-muted-foreground ml-2">(background)</span>
          )}
        </div>

        {/* Output */}
        {hasOutput(output) && (
          <div className="space-y-1.5">
            {typedOutput.previewUrl && typeof typedOutput.previewUrl === 'string' && (
              <div className="text-xs text-foreground">
                → Server started: <span className="font-mono">{typedOutput.previewUrl}</span>
              </div>
            )}
            {typedOutput.stdout && typeof typedOutput.stdout === 'string' && (
              <pre className="text-xs font-mono bg-muted/50 p-2 rounded border overflow-x-auto max-h-64 text-foreground/80">
{typedOutput.stdout}</pre>
            )}
            {typedOutput.stderr && typeof typedOutput.stderr === 'string' && (
              <pre className="text-xs font-mono bg-muted/50 p-2 rounded border overflow-x-auto max-h-64 text-foreground/70">
{typedOutput.stderr}</pre>
            )}
            {typedOutput.error && typeof typedOutput.error === 'string' && (
              <div className="text-xs text-red-600 dark:text-red-400">
                Error: {typedOutput.error}
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
      return <span className="text-muted-foreground">Writing file...</span>;
    }

    const lines = typedInput.content.split('\n').length;
    const preview = typedInput.content.slice(0, 200);

    return (
      <div className="space-y-2">
        {/* File path */}
        <div className="bg-muted/30 rounded px-3 py-2 border">
          <code className="text-xs font-mono">{safeString(typedInput.path)}</code>
          <span className="text-xs text-muted-foreground ml-2">({lines} lines)</span>
        </div>

        {/* Status */}
        {hasOutput(output) && (
          <div className="space-y-1.5">
            {typedOutput.success && (
              <div className="text-xs text-foreground">
                → File written successfully
              </div>
            )}
            {typedOutput.error && typeof typedOutput.error === 'string' && (
              <div className="text-xs text-red-600 dark:text-red-400">
                Error: {typedOutput.error}
              </div>
            )}
          </div>
        )}

        {/* Content preview */}
        <details className="group">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            Show content
          </summary>
          <pre className="text-xs font-mono bg-muted/50 p-2 rounded border overflow-x-auto max-h-32 mt-1.5 text-foreground/80">
{preview}{typedInput.content.length > 200 && '\n...'}</pre>
        </details>
      </div>
    );
  };

  const renderSetPreviewUrl = () => {
    const typedInput = (input || {}) as SetPreviewUrlInput;
    const typedOutput = (output || {}) as SetPreviewUrlOutput;

    // Handle case where input is not yet available (streaming state)
    if (!typedInput.url) {
      return <span className="text-muted-foreground">Updating preview...</span>;
    }

    return (
      <div className="space-y-2">
        {/* URL */}
        <div className="bg-muted/30 rounded px-3 py-2 border">
          <code className="text-xs font-mono">{safeString(typedInput.url)}</code>
        </div>

        {/* Status */}
        {hasOutput(output) && typedOutput.success && typedOutput.message && typeof typedOutput.message === 'string' && (
          <div className="text-xs text-foreground">
            → {typedOutput.message}
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
    <div className="mb-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <div className="flex items-center gap-1.5">
          {getStateIcon()}
          <span className="font-medium">CodeFox wants to use {toolName}:</span>
        </div>
      </div>
      <div className="border-l-2 border-muted pl-4">
        {renderContent()}
      </div>
    </div>
  );
}
