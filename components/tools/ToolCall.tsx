import { useState } from "react";
import { ChevronRight } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(true);
  const part = toolPart as Record<string, unknown>;
  const input = part.input || part.args;
  const state = getToolState(toolPart);

  return (
    <div className="mb-3 text-sm min-w-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-muted-foreground mb-2 hover:text-foreground transition-colors w-full text-left min-w-0"
      >
        <ChevronRight
          className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
        {getStateIcon(state)}
        <span className="font-medium truncate">{getToolTitle(toolName, input, state)}</span>
      </button>
      {isOpen && (
        <div className="border-l-2 border-muted pl-4 ml-6 min-w-0">
          {renderTool(toolName, toolPart)}
        </div>
      )}
    </div>
  );
}
