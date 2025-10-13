"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ToolCall } from "@/components/tools/ToolCall";
import { isToolOrDynamicToolUIPart, getToolOrDynamicToolName } from "ai";
import type { UIMessage } from "ai";

interface MessageListProps {
  messages: UIMessage[];
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

          // Extract text content
          const textContent = message.parts
            .filter((part) => part.type === "text")
            .map((part) => {
              const textPart = part as { type: "text"; text: string };
              return textPart.text;
            })
            .join("");

          // Extract tool-related parts
          const toolParts = message.parts.filter(isToolOrDynamicToolUIPart);

          return (
            <div key={message.id} className="space-y-2">
              {textContent && (
                <ChatMessage
                  role={message.role as "user" | "assistant"}
                  content={textContent}
                  isLoading={isStreamingLastAssistant}
                />
              )}

              {/* Render tool calls */}
              {toolParts.map((toolPart) => {
                const toolName = getToolOrDynamicToolName(toolPart);
                const toolCallId = toolPart.toolCallId;

                return (
                  <ToolCall
                    key={toolCallId}
                    toolName={toolName}
                    toolPart={toolPart}
                  />
                );
              })}
            </div>
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
