import { PlayCircle, CheckCircle2, XCircle } from "lucide-react";
import type { TryStartDevServerInput, TryStartDevServerOutput } from "@/lib/tool-definitions";
import type { RenderResult } from "./types";

export function renderToolTryStartDevServer({
  input,
  output,
  state
}: {
  input: TryStartDevServerInput;
  output: TryStartDevServerOutput | undefined;
  state: "pending" | "completed" | "error";
}): RenderResult {
  const isCompleted = state === 'completed';
  const isError = state === 'error';

  const icon = isError ? XCircle : isCompleted ? CheckCircle2 : PlayCircle;
  const iconColor = isError ? 'text-red-500' : isCompleted ? 'text-green-500' : 'text-muted-foreground';

  const title = isCompleted
    ? 'CodeFox started the dev server'
    : 'CodeFox will start the dev server for you';

  const content = (
    <div className="space-y-2">
      {input.reason && (
        <div className="text-sm text-muted-foreground">
          {input.reason}
        </div>
      )}

      {output && (
        <div className="space-y-1.5">
          {output.success && output.url && (
            <div className="text-sm text-foreground">
              ✓ Server started at <span className="font-mono font-semibold">{output.url}</span>
            </div>
          )}
          {output.message && (
            <div className="text-sm text-muted-foreground">
              {output.message}
            </div>
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
