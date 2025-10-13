import { FileText, CheckCircle2, XCircle } from "lucide-react";
import type { WriteFileInput, WriteFileOutput } from "@/lib/tool-definitions";
import type { RenderResult } from "./types";

export function renderToolWriteFile({
  input,
  output,
  state
}: {
  input: WriteFileInput;
  output: WriteFileOutput | undefined;
  state: "pending" | "completed" | "error";
}): RenderResult {
  if (!input?.content) {
    return {
      icon: FileText,
      iconColor: 'text-muted-foreground',
      title: 'Writing file...',
      content: null,
    };
  }

  const fileName = input.path?.split('/').pop() || input.path || 'file';
  const lines = input.content?.split('\n').length || 0;
  const isCompleted = state === 'completed';
  const isError = state === 'error';

  const icon = isError ? XCircle : isCompleted ? CheckCircle2 : FileText;
  const iconColor = isError ? 'text-red-500' : isCompleted ? 'text-green-500' : 'text-muted-foreground';

  const title = isCompleted ? (
    <>
      CodeFox written to <code className="font-mono font-semibold">{fileName}</code>
      <span className="text-muted-foreground ml-1">({lines} lines)</span>
    </>
  ) : (
    <>
      CodeFox wants to write to <code className="font-mono font-semibold">{fileName}</code>
    </>
  );

  const content = (
    <div className="space-y-2">
      {output?.error && (
        <div className="text-xs text-red-600 dark:text-red-400">
          Error: {output.error}
        </div>
      )}

      <pre className="text-xs font-mono bg-muted/50 p-3 rounded border overflow-auto max-h-64 text-foreground/80 whitespace-pre-wrap break-words">
{input.content}</pre>
    </div>
  );

  return { icon, iconColor, title, content };
}
