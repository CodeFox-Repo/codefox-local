import { Monitor, CheckCircle2, XCircle } from "lucide-react";
import type { SetPreviewUrlInput, SetPreviewUrlOutput } from "@/lib/tool-definitions";
import type { RenderResult } from "./types";

export function renderToolSetPreviewUrl({
  input,
  output,
  state
}: {
  input: SetPreviewUrlInput;
  output: SetPreviewUrlOutput | undefined;
  state: "pending" | "completed" | "error";
}): RenderResult {

  if (!input?.url) {
    return {
      icon: Monitor,
      iconColor: 'text-muted-foreground',
      title: 'Updating preview...',
      content: null,
    };
  }

  const isCompleted = state === 'completed';
  const isError = state === 'error';

  const icon = isError ? XCircle : isCompleted ? CheckCircle2 : Monitor;
  const iconColor = isError ? 'text-red-500' : isCompleted ? 'text-green-500' : 'text-muted-foreground';

  const title = (
    <>
      CodeFox {isCompleted ? 'updated' : 'wants to update'} preview to <code className="font-mono font-semibold">{input.url}</code>
    </>
  );

  const content = (
    <div className="space-y-2">
      <div className="bg-muted/30 rounded px-3 py-2 border">
        <code className="text-xs font-mono">{input.url}</code>
      </div>

      {output?.success && output.message && (
        <div className="text-xs text-foreground">
          → {output.message}
        </div>
      )}
    </div>
  );

  return { icon, iconColor, title, content };
}
