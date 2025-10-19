"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { WelcomeScreen } from "./welcome-screen";
import { ToolCall } from "@/components/tools/tool-call";
import { isToolOrDynamicToolUIPart, getToolOrDynamicToolName } from "ai";
import type { UIMessage } from "ai";

interface MessageListProps {
  messages: UIMessage[];
  isLoading?: boolean;
  onPromptClick?: (prompt: string) => void;
  onShowHistory?: () => void;
  onSelectProject?: () => void;
}

export function MessageList({ messages, isLoading, onPromptClick, onShowHistory, onSelectProject }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <WelcomeScreen 
        onPromptClick={onPromptClick || (() => {})} 
        onShowHistory={onShowHistory}
        onSelectProject={onSelectProject}
      />
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4 pb-48 min-w-0" ref={scrollRef}>
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
            <div key={message.id} className="space-y-2 min-w-0">
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
