"use client";

import { Settings, Plus } from "lucide-react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/lib/settings-store";
import { ProjectHistory } from "@/components/project/ProjectHistory";
import type { UIMessage } from "ai";

interface ChatContainerProps {
  messages: UIMessage[];
  input: string;
  isLoading?: boolean;
  status?: 'submitted' | 'streaming' | 'ready' | 'error';
  onInputChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onNew?: () => void;
  onStop?: () => void;
}

export function ChatContainer({
  messages,
  input,
  isLoading,
  status,
  onInputChange,
  onSubmit,
  onNew,
  onStop
}: ChatContainerProps) {
  const setIsSettingsOpen = useSettingsStore((state) => state.setIsSettingsOpen);

  return (
    <div className="flex flex-col h-full bg-background min-w-0">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b min-w-0">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <ProjectHistory />
          <h1 className="text-base font-semibold whitespace-nowrap">Website Generator</h1>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          {onNew && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNew}
              title="New Project"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden min-w-0">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <div className="flex-shrink-0 min-w-0">
        <ChatInput
          value={input}
          onChange={onInputChange}
          onSubmit={onSubmit}
          isLoading={isLoading}
          status={status}
          onPause={onStop}
        />
      </div>
    </div>
  );
}
