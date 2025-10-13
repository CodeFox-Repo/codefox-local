export function renderToolDefault(toolName: string, input: unknown) {
  return (
    <div className="text-sm">
      <code className="font-mono">{toolName}</code>
      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
        {JSON.stringify(input, null, 2)}
      </pre>
    </div>
  );
}
