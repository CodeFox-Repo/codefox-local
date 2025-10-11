"use client";

import { MessageCircle } from "lucide-react";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import type { Message } from "@/types/chat";

interface ChatContainerProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onOpenUrl?: (url: string) => void;
}

export function ChatContainer({
  messages,
  input,
  isLoading,
  onInputChange,
  onSubmit,
  onOpenUrl,
}: ChatContainerProps) {
  return (
    <div className="flex flex-col h-full bg-[var(--chat-bg)]">
      {/* Header */}
      <div className="flex items-center gap-4 px-8 py-5 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-foreground tracking-tight">CodeFox AI</h2>
          <p className="text-xs text-gray-500">Powered by Claude Sonnet 4.5</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-gray-500">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} onOpenUrl={onOpenUrl} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 bg-gray-900/30 backdrop-blur-sm">
        <ChatInput
          input={input}
          isLoading={isLoading}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
