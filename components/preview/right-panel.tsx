"use client";

import { useEffect, useState, forwardRef } from "react";
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
import "@/components/preview/code-editor/sandpack-custom.css";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface RightPanelProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RightPanelRef {}

// Mock data for testing
const MOCK_FILES = {
  '/App.tsx': `export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Welcome to CodeFox
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
          Start building amazing things with AI
        </p>
        <button style={{
          padding: '0.75rem 1.5rem',
          background: 'white',
          color: '#667eea',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}`
};

// Internal component that uses Sandpack context
function RightPanelContent({ 
  activeTab, 
  setActiveTab,
  currentProject 
}: { 
  activeTab: 'preview' | 'code';
  setActiveTab: (tab: 'preview' | 'code') => void;
  currentProject: { id: string; title?: string; createdAt: Date } | null;
}) {
  const { sandpack } = useSandpack();
  const isLoading = sandpack.status === 'idle' || sandpack.status === 'initial';

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
  (_props, _ref) => {
    const [files, setFiles] = useState<Record<string, string>>(MOCK_FILES);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const { resolvedTheme } = useTheme();

    const currentProject = useProjectStore((state) => state.getCurrentProject());

  useEffect(() => {
    async function loadProjectFiles() {
      if (!currentProject) {
        console.log('[RightPanel] No currentProject, using mock data');
        setFiles(MOCK_FILES);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const listResponse = await fetch(
          `/api/project/files?projectId=${currentProject.id}`
        );
        
        if (!listResponse.ok) {
          throw new Error('Failed to load file list');
        }

        const { files: fileList } = await listResponse.json();
        const fileContents: Record<string, string> = {};
        
        for (const filePath of fileList) {
          try {
            const response = await fetch(
              `/api/project/file?projectId=${currentProject.id}&filePath=${encodeURIComponent(filePath)}`
            );
            
            if (response.ok) {
              const data = await response.json();
              const sandpackPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
              fileContents[sandpackPath] = data.content || '';
            }
          } catch (err) {
            console.warn(`Failed to load file ${filePath}:`, err);
          }
        }

        if (Object.keys(fileContents).length === 0) {
          console.log('[RightPanel] No files in project, using mock data');
          setFiles(MOCK_FILES);
        } else {
          setFiles(fileContents);
        }
      } catch (err) {
        console.error('Failed to load project files:', err);
        setFiles(MOCK_FILES);
      } finally {
        setLoading(false);
      }
    }

    loadProjectFiles();
  }, [currentProject]);

  const sandpackTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-muted/20">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-semibold">Loading project files...</h3>
        <p className="text-sm text-muted-foreground mt-2">
          This may take a moment
        </p>
      </div>
    );
  }

  return (
    <SandpackProvider
      files={files}
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
      />
    </SandpackProvider>
  );
});

RightPanel.displayName = "RightPanel";
