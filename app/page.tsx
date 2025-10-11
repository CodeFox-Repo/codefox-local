"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { IframeContainer } from "@/components/iframe/IframeContainer";

export default function Home() {
  const [iframeUrl, setIframeUrl] = useState("");
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const handleOpenUrl = (url: string) => {
    setIframeUrl(url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || status === 'streaming') return;

    // Send message using AI SDK v5 API
    sendMessage({
      role: "user",
      parts: [
        {
          type: "text",
          text: input.trim(),
        },
      ],
    });

    // Clear input
    setInput("");
  };

  const isLoading = status === 'streaming';

  // Convert UIMessage to our Message type for compatibility
  const convertedMessages = messages.map((msg: UIMessage) => ({
    id: msg.id,
    role: msg.role,
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
          onOpenUrl={handleOpenUrl}
        />
      }
      rightPanel={
        <IframeContainer
          url={iframeUrl}
          onUrlChange={setIframeUrl}
        />
      }
    />
  );
}
