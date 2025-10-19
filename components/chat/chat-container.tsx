"use client";

import { useState } from "react";
import { Settings, Plus, History } from "lucide-react";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { HistoryView } from "./history-view";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/lib/settings-store";
import type { UIMessage } from "ai";

interface ChatContainerProps {
  messages: UIMessage[];
  input: string;
  isLoading?: boolean;
  status?: "submitted" | "streaming" | "ready" | "error";
  onInputChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onNew: () => void;
  onStop?: () => void;
  onPromptClick?: (prompt: string) => void;
}

export function ChatContainer({
  messages,
  input,
  isLoading,
  status,
  onInputChange,
  onSubmit,
  onNew,
  onStop,
  onPromptClick,
}: ChatContainerProps) {
  const [showHistory, setShowHistory] = useState(false);
  const setIsSettingsOpen = useSettingsStore(
    (state) => state.setIsSettingsOpen
  );

  const handleShowHistory = () => {
    setShowHistory(true);
  };

  const handleHideHistory = () => {
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col h-full bg-background min-w-0">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b min-w-0">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <h1 className="text-base font-semibold whitespace-nowrap">Codefox</h1>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShowHistory}
            title="Project History"
          >
            <History className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNew}
            title="New Project"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {showHistory ? (
        <div className="flex-1 overflow-hidden min-w-0">
          <HistoryView
            onBack={handleHideHistory}
            onSelectProject={handleHideHistory}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden min-w-0 relative">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onPromptClick={onPromptClick}
            onShowHistory={handleShowHistory}
            onSelectProject={handleHideHistory}
          />
          
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
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
      )}
    </div>
  );
}
