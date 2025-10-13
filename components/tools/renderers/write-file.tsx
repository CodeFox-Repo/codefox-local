import type { WriteFileInput, WriteFileOutput } from "@/lib/tool-definitions";

export function renderToolWriteFile(
  input: WriteFileInput,
  output?: WriteFileOutput
) {
  if (!input.content) {
    return <span className="text-muted-foreground">Writing file...</span>;
  }

  return (
    <div className="space-y-2">
      {output?.error && (
        <div className="text-xs text-red-600 dark:text-red-400">
          Error: {output.error}
        </div>
      )}

      <pre className="text-xs font-mono bg-muted/50 p-3 rounded border overflow-x-auto max-h-64 text-foreground/80">
{input.content}</pre>
    </div>
  );
}
