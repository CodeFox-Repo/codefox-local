import type { WriteFileInput } from "@/lib/tool-definitions";

export function getToolTitle(
  toolName: string,
  input: unknown,
  state: "pending" | "completed" | "error"
) {
  const isCompleted = state === 'completed';

  if (toolName === 'writeFile') {
    const typedInput = (input || {}) as WriteFileInput;
    const fileName = typedInput.path?.split('/').pop() || typedInput.path || 'file';
    const lines = typedInput.content?.split('\n').length || 0;

    if (isCompleted) {
      return (
        <>
          CodeFox written to <code className="font-mono font-semibold">{fileName}</code>
          <span className="text-muted-foreground ml-1">({lines} lines)</span>
        </>
      );
    } else {
      return (
        <>
          CodeFox wants to write to <code className="font-mono font-semibold">{fileName}</code>
        </>
      );
    }
  }

  return `CodeFox wants to use ${toolName}:`;
}
