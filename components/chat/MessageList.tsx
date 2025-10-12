"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import type { Message } from "@/types/chat";

interface MessageListProps {
  messages: Message[];
  onOpenUrl?: (url: string) => void;
}

export function MessageList({ messages, onOpenUrl }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <Empty className="h-full border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="size-16 mb-2">
            <Sparkles className="size-8 text-primary" />
          </EmptyMedia>
          <EmptyTitle className="text-3xl">Welcome to CodeFox</EmptyTitle>
          <EmptyDescription className="text-base">
            Your AI-powered assistant for browsing, coding, and exploring the web.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" size="sm">
              🌐 Open Google
            </Button>
            <Button variant="outline" size="sm">
              ⚛️ Explain React
            </Button>
            <Button variant="outline" size="sm">
              📰 Latest News
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-8 space-y-6">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onOpenUrl={onOpenUrl}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
