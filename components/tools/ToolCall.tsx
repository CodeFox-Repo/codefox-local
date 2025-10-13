import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { UIDataTypes, UIMessagePart, UITools } from "ai";
import {
  renderToolWriteFile,
  renderToolExecuteCommand,
  renderToolSetPreviewUrl,
  renderToolTryStartDevServer,
  renderToolDefault,
} from ".";
import type { RenderResult } from "./types";

interface ToolCallProps {
  toolName: string;
  toolPart: UIMessagePart<UIDataTypes, UITools>;
}

type ToolRenderer = (params: {
  input: unknown;
  output: unknown;
  state: "pending" | "completed" | "error";
}) => RenderResult;

const toolMap: Record<string, ToolRenderer> = {
  writeFile: renderToolWriteFile as ToolRenderer,
  executeCommand: renderToolExecuteCommand as ToolRenderer,
  setPreviewUrl: renderToolSetPreviewUrl as ToolRenderer,
  tryStartDevServer: renderToolTryStartDevServer as ToolRenderer,
};

function getToolState(part: UIMessagePart<UIDataTypes, UITools>): "pending" | "completed" | "error" {
  const state = (part as Record<string, unknown>).state as string | undefined;

  if (state === "output-error" || state === "error") {
    return "error";
  } else if (state === "output-available" || (part as Record<string, unknown>).output !== undefined) {
    return "completed";
  }

  return "pending";
}

function renderTool(
  toolName: string,
  toolPart: UIMessagePart<UIDataTypes, UITools>,
  state: "pending" | "completed" | "error"
): RenderResult {
  const part = toolPart as Record<string, unknown>;
  const input = part.input || part.args;
  const output = part.output;

  if (!input) {
    return {
      icon: ChevronRight,
      iconColor: 'text-muted-foreground',
      title: 'Loading...',
      content: null,
    };
  }

  const renderer = toolMap[toolName];
  if (renderer) {
    return renderer({ input, output, state });
  }

  return renderToolDefault(toolName, { input, output, state });
}

export function ToolCall({ toolName, toolPart }: ToolCallProps) {
  const [isOpen, setIsOpen] = useState(true);
  const state = getToolState(toolPart);
  const { icon: Icon, iconColor, title, content } = renderTool(toolName, toolPart, state);

  return (
    <div className="mb-3 text-sm min-w-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-full text-left min-w-0"
      >
        <ChevronRight
          className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
        <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
        <span className="font-medium truncate">{title}</span>
      </button>
      {isOpen && content && (
        <div className="border-l-2 border-muted pl-4 ml-6 min-w-0">
          {content}
        </div>
      )}
    </div>
  );
}
