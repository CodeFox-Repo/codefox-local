"use client";

import { useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { IframeContainer } from "@/components/iframe/IframeContainer";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useProjectStore } from "@/lib/store";
import { createProject, setPreviewUrl } from "@/lib/client-tools";
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

  const { messages, sendMessage, addToolResult, status } = useChat({
    transport,
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
    },
    async onToolCall({ toolCall }) {
      // Check if it's a dynamic tool first for proper type narrowing
      if (toolCall.dynamic) {
        return;
      }

      if (toolCall.toolName === 'setPreviewUrl') {
        try {
          const input = toolCall.input as { url: string };
          await setPreviewUrl(input.url);

          // No await - avoids potential deadlocks
          addToolResult({
            tool: 'setPreviewUrl',
            toolCallId: toolCall.toolCallId,
            output: { success: true, message: `Preview updated to ${input.url}` },
          });
        } catch (err) {
          addToolResult({
            tool: 'setPreviewUrl',
            toolCallId: toolCall.toolCallId,
            state: 'output-error',
            errorText: err instanceof Error ? err.message : 'Failed to update preview',
          });
        }
      }
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

  return (
    <>
      <MainLayout
        leftPanel={
          <ChatContainer
            messages={messages.filter((msg) => msg.role !== "system")}
            input={input}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        }
        rightPanel={<IframeContainer />}
      />
      <SettingsModal />
    </>
  );
}
