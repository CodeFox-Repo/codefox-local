import { Wrench, CheckCircle2, XCircle } from "lucide-react";
import type { RenderResult } from "./types";

export function renderToolDefault(
  toolName: string,
  {
    input,
    state
  }: {
    input: unknown;
    output: unknown;
    state: "pending" | "completed" | "error";
  }
): RenderResult {
  const isCompleted = state === 'completed';
  const isError = state === 'error';

  const icon = isError ? XCircle : isCompleted ? CheckCircle2 : Wrench;
  const iconColor = isError ? 'text-red-500' : isCompleted ? 'text-green-500' : 'text-muted-foreground';

  const title = `CodeFox ${isCompleted ? 'used' : 'wants to use'} ${toolName}`;

  const content = (
    <div className="text-sm">
      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
        {JSON.stringify(input, null, 2)}
      </pre>
    </div>
  );

  return { icon, iconColor, title, content };
}
