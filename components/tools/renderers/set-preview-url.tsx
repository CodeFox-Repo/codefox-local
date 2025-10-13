import type { SetPreviewUrlInput, SetPreviewUrlOutput } from "@/lib/tool-definitions";

export function renderToolSetPreviewUrl(
  input: SetPreviewUrlInput,
  output?: SetPreviewUrlOutput
) {
  if (!input.url) {
    return <span className="text-muted-foreground">Updating preview...</span>;
  }

  return (
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
}
