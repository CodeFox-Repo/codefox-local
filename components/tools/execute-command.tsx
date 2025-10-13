import { Terminal, CheckCircle2, XCircle } from "lucide-react";
import type { ExecuteCommandInput, ExecuteCommandOutput } from "@/lib/tool-definitions";

interface RenderResult {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export function renderToolExecuteCommand(
  input: ExecuteCommandInput,
  output?: ExecuteCommandOutput,
  state?: "pending" | "completed" | "error"
): RenderResult {
  if (!input.command) {
    return {
      icon: Terminal,
      iconColor: 'text-muted-foreground',
      title: 'Executing command...',
      content: null,
    };
  }

  const isCompleted = state === 'completed';
  const isError = state === 'error';

  const icon = isError ? XCircle : isCompleted ? CheckCircle2 : Terminal;
  const iconColor = isError ? 'text-red-500' : isCompleted ? 'text-green-500' : 'text-muted-foreground';

  const title = (
    <>
      CodeFox {isCompleted ? 'executed' : 'wants to execute'} <code className="font-mono font-semibold">{input.command}</code>
      {input.keepAlive && <span className="text-muted-foreground ml-1">(background)</span>}
    </>
  );

  const content = (
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
            <pre className="text-xs font-mono bg-muted/50 p-2 rounded border overflow-auto max-h-64 text-foreground/80 whitespace-pre-wrap break-words">
{output.stdout}</pre>
          )}
          {output.stderr && (
            <pre className="text-xs font-mono bg-muted/50 p-2 rounded border overflow-auto max-h-64 text-foreground/70 whitespace-pre-wrap break-words">
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

  return { icon, iconColor, title, content };
}
