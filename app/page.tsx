"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { IframeContainer } from "@/components/iframe/IframeContainer";

export default function Home() {
  const [input, setInput] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Extract generated code from messages
  useEffect(() => {
    // Look for code in the latest assistant message
    const lastAssistantMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === "assistant");

    if (lastAssistantMessage) {
      const content = lastAssistantMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => {
          if (part.type === "text") {
            return (part as { type: "text"; text: string }).text;
          }
          return "";
        })
        .join("");

      // Extract code between markers
      const codeMatch = content.match(
        /<!-- GENERATED_CODE_START -->([\s\S]*?)<!-- GENERATED_CODE_END -->/
      );

      if (codeMatch && codeMatch[1]) {
        setGeneratedCode(codeMatch[1].trim());
      }
    }
  }, [messages]);

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const handleSubmit = (value: string) => {
    if (!value.trim() || status === "streaming") return;

    // Send message using AI SDK v5 API
    sendMessage({
      role: "user",
      parts: [
        {
          type: "text",
          text: value.trim(),
        },
      ],
    });

    // Clear input
    setInput("");
  };

  const isLoading = status === "streaming";

  // Convert UIMessage to our Message type for compatibility
  const convertedMessages = messages
    .filter((msg) => msg.role !== "system")
    .map((msg: UIMessage) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content: msg.parts
        .filter((part) => part.type === "text")
        .map((part) => {
          if (part.type === "text") {
            return (part as { type: "text"; text: string }).text;
          }
          return "";
        })
        .join(""),
      createdAt: new Date(),
    }));

  return (
    <MainLayout
      leftPanel={
        <ChatContainer
          messages={convertedMessages}
          input={input}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      }
      rightPanel={<IframeContainer generatedCode={generatedCode} />}
    />
  );
}
