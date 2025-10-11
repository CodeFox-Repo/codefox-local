"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
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
      <div className="flex items-center justify-center h-full p-12">
        <div className="text-center space-y-6 max-w-lg">
          <div className="relative">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">
              Welcome to CodeFox
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your AI-powered assistant for browsing, coding, and exploring the web.
              <br />
              Ask me anything to get started!
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            <button className="px-4 py-2 text-sm bg-gray-800/50 hover:bg-gray-800 rounded-xl text-gray-300 transition-all hover:scale-105 border border-gray-700/50">
              🌐 Open Google
            </button>
            <button className="px-4 py-2 text-sm bg-gray-800/50 hover:bg-gray-800 rounded-xl text-gray-300 transition-all hover:scale-105 border border-gray-700/50">
              ⚛️ Explain React
            </button>
            <button className="px-4 py-2 text-sm bg-gray-800/50 hover:bg-gray-800 rounded-xl text-gray-300 transition-all hover:scale-105 border border-gray-700/50">
              📰 Latest News
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-8 py-6 space-y-8">
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
