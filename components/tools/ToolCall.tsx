import type { UIDataTypes, UIMessagePart, UITools } from "ai";
import { getStateIcon } from "./tool-icons";
import { getToolTitle } from "./tool-titles";
import {
  renderToolWriteFile,
  renderToolExecuteCommand,
  renderToolSetPreviewUrl,
  renderToolDefault,
} from "./renderers";
import type {
  WriteFileInput,
  WriteFileOutput,
  ExecuteCommandInput,
  ExecuteCommandOutput,
  SetPreviewUrlInput,
  SetPreviewUrlOutput,
} from "@/lib/tool-definitions";

interface ToolCallProps {
  toolName: string;
  toolPart: UIMessagePart<UIDataTypes, UITools>;
}

function getToolState(part: UIMessagePart<UIDataTypes, UITools>): "pending" | "completed" | "error" {
  const state = (part as Record<string, unknown>).state as string | undefined;

  if (state === "output-error" || state === "error") {
    return "error";
  } else if (state === "output-available" || (part as Record<string, unknown>).output !== undefined) {
    return "completed";
  }

  return "pending";
}

function renderTool(toolName: string, toolPart: UIMessagePart<UIDataTypes, UITools>) {
  const part = toolPart as Record<string, unknown>;
  const input = part.input || part.args;
  const output = part.output;

  switch (toolName) {
    case 'writeFile':
      return renderToolWriteFile(
        input as WriteFileInput,
        output as WriteFileOutput | undefined
      );
    case 'executeCommand':
      return renderToolExecuteCommand(
        input as ExecuteCommandInput,
        output as ExecuteCommandOutput | undefined
      );
    case 'setPreviewUrl':
      return renderToolSetPreviewUrl(
        input as SetPreviewUrlInput,
        output as SetPreviewUrlOutput | undefined
      );
    default:
      return renderToolDefault(toolName, input);
  }
}

export function ToolCall({ toolName, toolPart }: ToolCallProps) {
  const part = toolPart as Record<string, unknown>;
  const input = part.input || part.args;
  const state = getToolState(toolPart);

  return (
    <div className="mb-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <div className="flex items-center gap-1.5">
          {getStateIcon(state)}
          <span className="font-medium">{getToolTitle(toolName, input, state)}</span>
        </div>
      </div>
      <div className="border-l-2 border-muted pl-4">
        {renderTool(toolName, toolPart)}
      </div>
    </div>
  );
}
