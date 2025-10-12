"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ToolCall } from "@/components/tools/ToolCall";
import type { UIMessage, UIMessagePart } from "ai";

// Helper to check if part is a tool-related part
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isToolPart(part: UIMessagePart<any, any>): boolean {
  return part.type.startsWith('tool-') || part.type === 'dynamic-tool';
}

// Extract tool name from part type (e.g., "tool-writeFile" -> "writeFile")
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getToolName(part: UIMessagePart<any, any>): string | null {
  if (part.type === 'dynamic-tool' && 'toolName' in part) {
    return part.toolName as string;
  }
  if (part.type.startsWith('tool-')) {
    return part.type.substring(5); // Remove "tool-" prefix
  }
  return null;
}

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
          const toolParts = message.parts.filter(isToolPart);

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
              {toolParts.map((toolPart, idx) => {
                const toolName = getToolName(toolPart);
                if (!toolName) return null;
                console.log(toolPart)
                const part = toolPart as Record<string, unknown>;
                const toolCallId = part.toolCallId as string | undefined;
                const state = part.state as string | undefined;

                // Determine tool state
                let toolState: "pending" | "completed" | "error" = "pending";
                if (state === "output-error" || state === "error") {
                  toolState = "error";
                } else if (state === "result" || part.output !== undefined) {
                  toolState = "completed";
                }

                return (
                  <ToolCall
                    key={toolCallId || `${message.id}-tool-${idx}`}
                    toolName={toolName}
                    input={part.input || part.args}
                    output={part.output}
                    state={toolState}
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
