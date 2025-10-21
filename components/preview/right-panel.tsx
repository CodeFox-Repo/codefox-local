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
  getFiles: () => Record<string, string>;
  waitForReady: () => Promise<void>;
  isReady: () => boolean;
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
  const readyResolversRef = useRef<Array<() => void>>([]);

  // Expose file operations API
  useEffect(() => {
    const api: RightPanelRef = {
      writeFile: async (path: string, content: string) => {
        const result = writeFile(path, content);
        return result.success ? { success: true } : { success: false, error: result.error };
      },
      executeCommand: async (command: string) => {
        const result = executeCommand(command);
        return result;
      },
      getFiles: () => {
        // Get current files from Sandpack and convert to string format
        console.log('[RightPanelContent] Sandpack status:', sandpack.status);
        console.log('[RightPanelContent] Sandpack files:', sandpack.files);

        // Only return files if Sandpack is ready
        if (sandpack.status === 'idle' || sandpack.status === 'initial') {
          console.log('[RightPanelContent] Sandpack not ready yet, returning empty files');
          return {};
        }

        const files = sandpack.files || {};
        const result: Record<string, string> = {};

        for (const [path, file] of Object.entries(files)) {
          if (typeof file === 'object' && file !== null && 'code' in file) {
            result[path] = (file as { code: string }).code;
          } else if (typeof file === 'string') {
            result[path] = file;
          }
        }

        console.log('[RightPanelContent] Converted files:', result);
        return result;
      },
      waitForReady: () => {
        return new Promise<void>((resolve) => {
          if (sandpack.status === 'running') {
            resolve();
          } else {
            readyResolversRef.current.push(resolve);
          }
        });
      },
      isReady: () => {
        return sandpack.status === 'running';
      },
    };

    fileApiRef.current = api;
  }, [writeFile, executeCommand, fileApiRef, sandpack]);

  // Resolve all pending waitForReady promises when Sandpack becomes ready
  useEffect(() => {
    if (sandpack.status === 'running') {
      console.log('[RightPanelContent] Sandpack is ready, resolving pending promises');
      readyResolversRef.current.forEach(resolve => resolve());
      readyResolversRef.current = [];
    }
  }, [sandpack.status]);

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
            showOpenInCodeSandbox={true}
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
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('code');
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();
    const fileApiRef = useRef<RightPanelRef | null>(null);

    const currentProject = useProjectStore((state) => state.getCurrentProject());

    useEffect(() => {
      setMounted(true);
    }, []);

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
      getFiles: () => {
        if (!fileApiRef.current) {
          console.warn('[RightPanel] getFiles called but fileApiRef is null');
          return {};
        }
        const files = fileApiRef.current.getFiles();
        console.log('[RightPanel] getFiles result:', files);
        return files;
      },
      waitForReady: async () => {
        // Wait for fileApiRef to be initialized
        if (!fileApiRef.current) {
          console.log('[RightPanel] Waiting for fileApiRef to be initialized...');
          await new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
              if (fileApiRef.current) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 10);
          });
        }
        if (!fileApiRef.current) {
          throw new Error('Failed to initialize fileApiRef');
        }
        return fileApiRef.current.waitForReady();
      },
      isReady: () => {
        if (!fileApiRef.current) {
          return false;
        }
        return fileApiRef.current.isReady();
      },
    }), []);

  // Use 'dark' as default until mounted to avoid hydration mismatch
  const sandpackTheme = mounted && resolvedTheme === 'light' ? 'light' : 'dark';

  return (
    <SandpackProvider
      template="react-ts"
      files={CODEFOX_SANDPACK_TEMPLATE}
      theme={sandpackTheme}
      options={{
        autorun: true,
        autoReload: true,
        recompileMode: "delayed",
        recompileDelay: 500,
        externalResources: ["https://cdn.tailwindcss.com"],
        classes: {
          "sp-wrapper": "custom-wrapper",
          "sp-layout": "custom-layout",
          "sp-tab-button": "custom-tab",
        },
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
