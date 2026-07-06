"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { ChatContainer } from "@/components/chat/chat-container";
import { RightPanel, type RightPanelRef } from "@/components/preview/right-panel";
import { MainLayout } from "@/components/layout/main-layout";
import { SettingsModal } from "@/components/settings/settings-modal";
import { useProjectStore } from "@/lib/store";
import { createProject, requestProjectTitle } from "@/lib/client-tools";
import { clientToolCall } from "@/lib/client-tool-handlers";
import { setRightPanelRef, getRightPanelRef } from "@/lib/preview-ref";
import { toast } from "sonner";

export default function Home() {
  const [input, setInput] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const lastProjectIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const shouldCancelRef = useRef(false);
  const rightPanelRef = useRef<RightPanelRef>(null);

  const projectId = useProjectStore((state) => state.currentProjectId);
  const setProject = useProjectStore((state) => state.setCurrentProject);
  const syncMessages = useProjectStore((state) => state.setMessages);
  const setProjectTitle = useProjectStore((state) => state.setProjectTitle);
  const project = useProjectStore((state) => state.getCurrentProject());

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
        body: async () => {
          const currentProject = useProjectStore.getState().getCurrentProject();

          // Get file contents from Sandpack via rightPanelRef
          let fileContents: Record<string, string> = {};
          try {
            const panelRef = getRightPanelRef();
            if (panelRef) {
              // Wait for Sandpack to be ready before getting files
              if (panelRef.waitForReady) {
                console.log('[Transport] Waiting for Sandpack to be ready...');
                await panelRef.waitForReady();
                console.log('[Transport] Sandpack is ready!');
              }

              if (panelRef.getFiles) {
                const sandpackFiles = panelRef.getFiles();
                if (sandpackFiles && typeof sandpackFiles === 'object') {
                  fileContents = sandpackFiles;
                }
              }
            }
          } catch (error) {
            console.warn('[Transport] Failed to get files from Sandpack:', error);
          }

          console.log('[Transport] Sending file contents:', Object.keys(fileContents));

          // Get file organization instruction from environment or project settings
          const fileInstruction = process.env.NEXT_PUBLIC_FILE_INSTRUCTION || `
## File Organization & Workflow

**CRITICAL - Start Here:**
- /App.tsx - Main application component. THIS IS WHERE YOU START. Modify this first for the main UI.
- /index.tsx - React entry point (already configured, do not modify)
- /styles.css - Base Tailwind CSS variables (already configured with design system, do not modify unless user explicitly requests)

**Project Structure (Create only when needed):**
- src/components/ - Reusable React components (e.g., button.tsx, user-card.tsx)
- src/utils/ - Utility functions (e.g., format-date.ts, api-client.ts)
- src/types/ - TypeScript type definitions (e.g., user.ts, api.ts)
- src/hooks/ - Custom React hooks (e.g., use-auth.ts)
- src/api/ - API/data fetching logic (e.g., users.ts)

**Design System (Follow Strictly):**
- NEVER use explicit colors like text-white, bg-white, text-black in components
- ALWAYS use Tailwind design tokens from styles.css (e.g., bg-background, text-foreground, bg-primary)
- The design system is already configured with beautiful colors, gradients, and CSS variables
- Use semantic color classes: bg-primary, bg-secondary, bg-accent, bg-muted, etc.
- For dark mode, use dark: prefix (e.g., dark:bg-background) - it's already configured

**Coding Standards:**
- File names: kebab-case (user-profile.tsx, api-client.ts)
- Component names: PascalCase matching file name (UserProfile in user-profile.tsx)
- Create small, focused components instead of large monolithic files
- MAXIMIZE EFFICIENCY: Focus on what user explicitly requested, avoid scope creep

**Workflow:**
1. Start by editing /App.tsx for main UI
2. Create src/* files only when you need reusable components or utilities
3. Keep it simple and elegant - don't overengineer
4. Use the design system tokens consistently
          `.trim();

          return {
            projectId: currentProject?.id,
            fileContents: fileContents,
            fileInstruction: fileInstruction,
          };
        },
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
      console.log('[Home] Tool call received:', toolCall.toolName);
      const panelRef = getRightPanelRef();
      await clientToolCall({ toolCall, addToolResult, sandpackAPI: panelRef });
      console.log('[Home] Tool call completed:', toolCall.toolName);
    },
    onFinish: (message) => {
      console.log('[Home] Chat finished, message:', message);
      setIsPending(false);
      abortControllerRef.current = null;
    },
  });

  useEffect(() => {
    if (rightPanelRef.current) {
      setRightPanelRef(rightPanelRef.current);
    }
    return () => {
      setRightPanelRef(null);
    };
  }, []);

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
        rightPanel={<RightPanel ref={rightPanelRef} />}
      />
      <SettingsModal />
    </>
  );
}
