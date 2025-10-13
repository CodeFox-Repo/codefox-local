import type { ExecuteCommandInput, ExecuteCommandOutput } from "@/lib/tool-definitions";

export function renderToolExecuteCommand(
  input: ExecuteCommandInput,
  output?: ExecuteCommandOutput
) {
  if (!input.command) {
    return <span className="text-muted-foreground">Executing command...</span>;
  }

  return (
    <div className="space-y-2">
      <div className="bg-muted/30 rounded px-3 py-2 border">
        <code className="text-xs font-mono">{input.command}</code>
        {input.keepAlive && (
          <span className="text-xs text-muted-foreground ml-2">(background)</span>
        )}
      </div>

      {output && (
        <div className="space-y-1.5">
          {output.previewUrl && (
            <div className="text-xs text-foreground">
              → Server started: <span className="font-mono">{output.previewUrl}</span>
            </div>
          )}
          {output.stdout && (
            <pre className="text-xs font-mono bg-muted/50 p-2 rounded border overflow-x-auto max-h-64 text-foreground/80">
{output.stdout}</pre>
          )}
          {output.stderr && (
            <pre className="text-xs font-mono bg-muted/50 p-2 rounded border overflow-x-auto max-h-64 text-foreground/70">
{output.stderr}</pre>
          )}
          {output.error && (
            <div className="text-xs text-red-600 dark:text-red-400">
              Error: {output.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
