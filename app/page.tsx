"use client";

import { useState, useMemo, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { IframeContainer } from "@/components/iframe/IframeContainer";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useProjectStore } from "@/lib/store";
import { createProject } from "@/lib/client-tools";
import { clientToolCall } from "@/lib/client-tool-handlers";
import { toast } from "sonner";

export default function Home() {
  const [input, setInput] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);

  // Subscribe to specific fields from store to trigger re-renders
  const currentProjectId = useProjectStore((state) => state.currentProjectId);
  const getCurrentProject = useProjectStore((state) => state.getCurrentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const saveMessages = useProjectStore((state) => state.setMessages);

  const currentProject = getCurrentProject();

  // Create transport with dynamic projectId using body function
  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
        body: () => ({
          projectId: useProjectStore.getState().getCurrentProject()?.id,
        }),
      }),
    []
  );

  const { messages, sendMessage, addToolResult, status, setMessages: setAIMessages, stop } = useChat({
    transport,
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
    },
    async onToolCall({ toolCall }) {
      await clientToolCall({ toolCall, addToolResult });
    },
  });

  // Sync messages to store whenever they change
  useEffect(() => {
    if (messages.length > 0 && currentProject) {
      saveMessages(messages);
    }
  }, [messages, currentProject, saveMessages]);

  // Restore messages when project switches (only when projectId changes)
  useEffect(() => {

    if (!currentProjectId) {
      setAIMessages([]);
      return;
    }

    const snapshot = useProjectStore.getState().projectSnapshots[currentProjectId];
    if (!snapshot) {
      setAIMessages([]);
      return;
    }

    console.log('[PageEffect] Restoring messages for project:', currentProjectId, 'messages:', snapshot.messages.length);
    setAIMessages(snapshot.messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId]); // Only depend on projectId, not storedMessages

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const handleSubmit = async (value: string) => {
    if (!value.trim() || status === "streaming" || isInitializing) {
      return;
    }

    // Check if we need to create a new project
    // This happens when:
    // 1. No current project in store
    // 2. No messages yet (fresh start)
    const needsNewProject = !currentProject || messages.length === 0;

    if (needsNewProject) {
      // Initialize project first
      setIsInitializing(true);
      try {
        toast.info("Initializing project...");
        const project = await createProject(`website-${Date.now()}`);
        setCurrentProject(project);
        toast.success("Project initialized!");

        // Wait a tick for store to update
        await new Promise(resolve => setTimeout(resolve, 0));

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

  const handleNewProject = () => {
    // Save current snapshot first
    const currentId = useProjectStore.getState().currentProjectId;
    if (currentId) {
      useProjectStore.getState().saveCurrentSnapshot();
    }

    // Clear current project and messages
    useProjectStore.setState({
      currentProjectId: null,
      messages: [],
      input: '',
    });
    setAIMessages([]);
    setInput("");
    toast.info("Ready to create a new project");
  };

  const handleStop = () => {
    stop();
    toast.info("Stream stopped");
  };

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <>
      <MainLayout
        leftPanel={
          <ChatContainer
            messages={messages.filter((msg) => msg.role !== "system")}
            input={input}
            isLoading={isLoading}
            status={status}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onNew={handleNewProject}
            onStop={handleStop}
          />
        }
        rightPanel={<IframeContainer />}
      />
      <SettingsModal />
    </>
  );
}
