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
import type {
  WriteFileInput,
  WriteFileOutput,
  ExecuteCommandInput,
  ExecuteCommandOutput,
  SetPreviewUrlInput,
  SetPreviewUrlOutput,
  TryStartDevServerInput,
  TryStartDevServerOutput,
} from "@/lib/tool-definitions";

interface ToolCallProps {
  toolName: string;
  toolPart: UIMessagePart<UIDataTypes, UITools>;
}

interface RenderResult {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: React.ReactNode;
  content: React.ReactNode;
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

function renderTool(
  toolName: string,
  toolPart: UIMessagePart<UIDataTypes, UITools>,
  state: "pending" | "completed" | "error"
): RenderResult {
  const part = toolPart as Record<string, unknown>;
  const input = part.input || part.args;
  if(!input) {
    return {
      icon: ChevronRight,
      iconColor: 'text-muted-foreground',
      title: 'Loading...',
      content: null,
    };
  }
  const output = part.output;


  switch (toolName) {
    case 'writeFile':
      return renderToolWriteFile(
        input as WriteFileInput,
        output as WriteFileOutput | undefined,
        state
      );
    case 'executeCommand':
      return renderToolExecuteCommand(
        input as ExecuteCommandInput,
        output as ExecuteCommandOutput | undefined,
        state
      );
    case 'setPreviewUrl':
      return renderToolSetPreviewUrl(
        input as SetPreviewUrlInput,
        output as SetPreviewUrlOutput | undefined,
        state
      );
    case 'tryStartDevServer':
      return renderToolTryStartDevServer(
        input as TryStartDevServerInput,
        output as TryStartDevServerOutput | undefined,
        state
      );
    default:
      return renderToolDefault(toolName, input, state);
  }
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
