"use client";

import { useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { IframeContainer } from "@/components/iframe/IframeContainer";
import { useProjectStore } from "@/lib/store";
import { createProject } from "@/lib/client-tools";
import { toast } from "sonner";

export default function Home() {
  const [input, setInput] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const { currentProject, setCurrentProject } = useProjectStore();

  // Create transport with dynamic projectId using body function
  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
        body: () => ({
          projectId: useProjectStore.getState().currentProject?.id,
        }),
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
    },
  });

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const handleSubmit = async (value: string) => {
    if (!value.trim() || status === "streaming" || isInitializing) {
      return;
    }

    // Check if this is the first message (project not created yet)
    const isFirstMessage = messages.length === 0 && !currentProject;

    if (isFirstMessage) {
      // Initialize project first
      setIsInitializing(true);
      try {
        toast.info("Initializing project...");
        const project = await createProject(`website-${Date.now()}`);
        setCurrentProject(project);
        toast.success("Project initialized!");

        // Now send the message after project is created
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
      } catch (error) {
        console.error("Failed to create project:", error);
        toast.error("Failed to initialize project");
      } finally {
        setIsInitializing(false);
      }
    } else {
      // Project already exists, just send the message
      if (!currentProject) {
        toast.error("Project not initialized yet");
        return;
      }

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
    }
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
    <>
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
        rightPanel={<IframeContainer generatedCode={""} />}
      />
    </>
  );
}
