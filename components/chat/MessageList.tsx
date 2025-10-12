"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { Spinner } from "@/components/ui/spinner";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Start a conversation</h3>
          <p className="text-sm">Describe the website you want to create and I&apos;ll help you build it.</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4" ref={scrollRef}>
        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          const isStreamingLastAssistant = isLastMessage && message.role === 'assistant' && isLoading;

          return (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              isLoading={isStreamingLastAssistant}
            />
          );
        })}
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <ChatMessage
            role="assistant"
            content=""
            isLoading={true}
          />
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
