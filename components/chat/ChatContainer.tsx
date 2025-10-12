"use client";

import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContainerProps {
  messages: Message[];
  input: string;
  isLoading?: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export function ChatContainer({
  messages,
  input,
  isLoading,
  onInputChange,
  onSubmit
}: ChatContainerProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-shrink-0 p-4 border-b">
        <h1 className="text-xl font-bold">Website Generator</h1>
        <p className="text-sm text-muted-foreground">
          Create beautiful websites with AI assistance
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <div className="flex-shrink-0">
        <ChatInput
          value={input}
          onChange={onInputChange}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
