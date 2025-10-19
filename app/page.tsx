"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { ChatContainer } from "@/components/chat/chat-container";
import { RightPanel } from "@/components/preview/right-panel";
import { MainLayout } from "@/components/layout/main-layout";
import { SettingsModal } from "@/components/settings/settings-modal";
import { useProjectStore } from "@/lib/store";
import { createProject, requestProjectTitle } from "@/lib/client-tools";
import { clientToolCall } from "@/lib/client-tool-handlers";
import { toast } from "sonner";

export default function Home() {
  const [input, setInput] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const lastProjectIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const shouldCancelRef = useRef(false);

  const projectId = useProjectStore((state) => state.currentProjectId);
  const setProject = useProjectStore((state) => state.setCurrentProject);
  const syncMessages = useProjectStore((state) => state.setMessages);
  const setProjectTitle = useProjectStore((state) => state.setProjectTitle);
  const project = useProjectStore((state) => state.getCurrentProject());

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

  const { messages, sendMessage, addToolResult, status, setMessages: setChatMessages, stop } = useChat({
    transport,
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
      setIsPending(false);
      setIsInitializing(false);
      abortControllerRef.current = null;
    },
    async onToolCall({ toolCall }) {
      await clientToolCall({ toolCall, addToolResult });
    },
    onFinish: () => {
      setIsPending(false);
      abortControllerRef.current = null;
    },
  });

  useEffect(() => {
    const previousId = lastProjectIdRef.current;
    lastProjectIdRef.current = projectId;

    if (
      !projectId ||
      !project ||
      messages.length === 0 ||
      (previousId && previousId !== projectId)
    ) {
      return;
    }

    syncMessages(messages);
  }, [messages, projectId, project, syncMessages]);

  useEffect(() => {
    if (!projectId) {
      setChatMessages([]);
      return;
    }

    const snapshot = useProjectStore.getState().projectSnapshots[projectId];
    if (!snapshot) {
      setChatMessages([]);
      return;
    }

    setChatMessages(snapshot.messages);
  }, [projectId, setChatMessages]);

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const sendUserMessage = (text: string) => {
    sendMessage({
      role: "user",
      parts: [
        {
          type: "text",
          text,
        },
      ],
    });
    setInput("");
  };

  const handleSubmit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || isInitializing || isPending || status === "submitted") {
      return;
    }

    shouldCancelRef.current = false;
    
    if (!project || messages.length === 0) {
      setIsInitializing(true);
      setIsPending(true);
      
      try {
        if (shouldCancelRef.current) {
          return;
        }
        
        const nextProject = await createProject(`website-${Date.now()}`);
        
        if (shouldCancelRef.current) {
          return;
        }
        
        setProject(nextProject);

        await new Promise((resolve) => setTimeout(resolve, 0));
        
        if (shouldCancelRef.current) {
          return;
        }
        
        abortControllerRef.current = new AbortController();
        sendUserMessage(trimmed);

        const title = await requestProjectTitle(nextProject.id, trimmed);
        if (title && !shouldCancelRef.current) {
          setProjectTitle(nextProject.id, title);
        }
  
      } catch (error) {
        console.error("Failed to create project:", error);
        toast.error("Failed to initialize project");
      } finally {
        setIsInitializing(false);
        setIsPending(false);
        abortControllerRef.current = null;
      }
    } else {
      setIsPending(true);
      abortControllerRef.current = new AbortController();
      sendUserMessage(trimmed);
    }
  };

  const handleNewProject = () => {
    const activeId = useProjectStore.getState().currentProjectId;
    if (activeId) {
      useProjectStore.getState().saveCurrentSnapshot();
    }

    useProjectStore.setState({
      currentProjectId: null,
      messages: [],
      input: '',
    });
    setChatMessages([]);
    setInput("");
  };

  const handleStop = () => {
    shouldCancelRef.current = true;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    stop();
    
    setIsPending(false);
    setIsInitializing(false);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const isLoading = status === "streaming" || status === "submitted" || isPending || isInitializing;

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
            onPromptClick={handlePromptClick}
          />
        }
        rightPanel={<RightPanel />}
      />
      <SettingsModal />
    </>
  );
}
