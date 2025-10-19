"use client";

import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Code, Eye, Loader2 } from "lucide-react";
import { useProjectStore } from "@/lib/store";
import { SandpackEditor } from "@/components/preview/code-editor";
import { 
  SandpackProvider,
  SandpackPreview,
  useSandpack
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useSandpackFiles } from "@/hooks/use-sandpack-files";
import { CODEFOX_SANDPACK_TEMPLATE } from "@/lib/sandpack-template";
import "@/components/preview/code-editor/sandpack-custom.css";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface RightPanelProps {}

export interface RightPanelRef {
  writeFile: (path: string, content: string) => Promise<{ success: boolean; error?: string }>;
  executeCommand: (command: string) => Promise<{ success: boolean; message?: string }>;
}

// Internal component that uses Sandpack context
interface RightPanelContentProps {
  activeTab: 'preview' | 'code';
  setActiveTab: (tab: 'preview' | 'code') => void;
  currentProject: { id: string; title?: string; createdAt: Date } | null;
  fileApiRef: React.MutableRefObject<RightPanelRef | null>;
}

function RightPanelContent({ 
  activeTab, 
  setActiveTab,
  currentProject,
  fileApiRef
}: RightPanelContentProps) {
  const { sandpack } = useSandpack();
  const { writeFile, executeCommand } = useSandpackFiles();
  const isLoading = sandpack.status === 'idle' || sandpack.status === 'initial';

  // Expose file operations API
  useEffect(() => {
    const api = {
      writeFile: async (path: string, content: string) => {
        const result = writeFile(path, content);
        return result.success ? { success: true } : { success: false, error: result.error };
      },
      executeCommand: async (command: string) => {
        const result = executeCommand(command);
        return result;
      },
    };

    fileApiRef.current = api;

    // Register API to store for client-side tools
    useProjectStore.getState().setSandpackAPI(api);

    return () => {
      // Cleanup on unmount
      useProjectStore.getState().clearSandpackAPI();
    };
  }, [writeFile, executeCommand, fileApiRef]);

  return (
    <div className="flex flex-col h-full">
      {/* Header: Custom Tabs */}
      <div className="flex-shrink-0 flex items-center px-2 py-3.5 border-b bg-background">
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              activeTab === 'preview'
                ? "bg-background text-foreground shadow"
                : "hover:bg-background/50"
            )}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              activeTab === 'code'
                ? "bg-background text-foreground shadow"
                : "hover:bg-background/50"
            )}
          >
            <Code className="h-4 w-4 mr-2" />
            Code
          </button>
        </div>
      </div>

      {/* Body: All content rendered, controlled by CSS */}
      <div className="flex-1 relative overflow-hidden">
        {/* Loading overlay when Sandpack is initializing */}
        {isLoading && activeTab === 'preview' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold">Initializing preview...</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Setting up the development environment
            </p>
          </div>
        )}

        {/* Preview Panel */}
        <div 
          className={cn(
            "absolute inset-0 w-full h-full overflow-hidden bg-white",
            activeTab === 'preview' ? 'block' : 'hidden'
          )}
        >
          <SandpackPreview
            className="sandpack-custom-preview"
            style={{ borderRadius: 0, height: '100%', width: '100%' }}
            showOpenInCodeSandbox={false}
          />
        </div>

        {/* Code Panel */}
        <div 
          className={cn(
            "absolute inset-0 w-full h-full overflow-hidden bg-white",
            activeTab === 'code' ? 'block' : 'hidden'
          )}
        >
          <SandpackEditor projectId={currentProject?.id || ''} />
        </div>
      </div>
    </div>
  );
}

export const RightPanel = forwardRef<RightPanelRef, RightPanelProps>(
  (_props, ref) => {
    const [initialized, setInitialized] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('code');
    const { resolvedTheme } = useTheme();
    const fileApiRef = useRef<RightPanelRef | null>(null);

    const currentProject = useProjectStore((state) => state.getCurrentProject());
    const messages = useProjectStore((state) => state.messages);

    // Expose API to parent via ref
    useImperativeHandle(ref, () => ({
      writeFile: async (path: string, content: string) => {
        if (!fileApiRef.current) {
          return { success: false, error: 'Sandpack not initialized' };
        }
        return fileApiRef.current.writeFile(path, content);
      },
      executeCommand: async (command: string) => {
        if (!fileApiRef.current) {
          return { success: false, message: 'Sandpack not initialized' };
        }
        return fileApiRef.current.executeCommand(command);
      },
    }), []);

  // Initialize project when user sends first message
  useEffect(() => {
    if (messages.length > 0 && !initialized) {
      console.log('[RightPanel] First message detected, initializing project');
      setInitialized(true);
      // Files are already set to CODEFOX_SANDPACK_TEMPLATE
      // AI will add more files via writeFile tool
    }
  }, [messages, initialized]);

  const sandpackTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  // Show welcome message before first message
  if (!initialized && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-muted/20">
        <Code className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Ready to Build</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Start a conversation to create your project.<br />
          AI will help you build files and preview them in real-time.
        </p>
      </div>
    );
  }

  return (
    <SandpackProvider
      files={CODEFOX_SANDPACK_TEMPLATE}
      template="react-ts"
      theme={sandpackTheme}
      options={{
        autorun: true,
        autoReload: true,
        recompileMode: "delayed",
        recompileDelay: 500
      }}
    >
      <RightPanelContent 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentProject={currentProject}
        fileApiRef={fileApiRef}
      />
    </SandpackProvider>
  );
});

RightPanel.displayName = "RightPanel";
