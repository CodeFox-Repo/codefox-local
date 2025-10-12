"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Code, Eye, Loader2, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useProjectStore } from "@/lib/store";

interface IframeContainerProps {
  generatedCode?: string;
}

export function IframeContainer({ generatedCode = "" }: IframeContainerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState(0);

  // Use devServer state instead of deprecated iframeUrl
  const devServer = useProjectStore((state) => state.devServer);
  const previewUrl = devServer.serverUrl;
  const serverStatus = devServer.status;

  useEffect(() => {
    if (generatedCode && iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(generatedCode);
        iframeDoc.close();
      }
    }
  }, [generatedCode, key]);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  const handleOpenInNewTab = () => {
    if (generatedCode) {
      const blob = new Blob([generatedCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <Tabs defaultValue="preview" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b">
          <TabsList>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
              {serverStatus === 'running' && (
                <span className="ml-2 h-2 w-2 bg-green-500 rounded-full animate-pulse" title="Dev server running" />
              )}
              {serverStatus === 'starting' && (
                <Loader2 className="ml-2 h-3 w-3 animate-spin text-blue-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              Code
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={!generatedCode}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleOpenInNewTab}
              disabled={!generatedCode}
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="preview" className="flex-1 m-0 p-4 overflow-hidden">
          {/* Dev server starting state */}
          {serverStatus === 'starting' && (
            <div className="flex flex-col items-center justify-center h-full border rounded-lg bg-muted/20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-semibold">Starting dev server...</h3>
              <p className="text-sm text-muted-foreground mt-2">
                This may take a few moments
              </p>
            </div>
          )}

          {/* Dev server error state */}
          {serverStatus === 'error' && (
            <div className="flex flex-col items-center justify-center h-full border rounded-lg bg-muted/20">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-red-500">Failed to start dev server</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Check the command output for errors
              </p>
            </div>
          )}

          {/* Dev server running - show preview */}
          {previewUrl && serverStatus === 'running' && (
            <iframe
              key={key}
              src={previewUrl}
              className="w-full h-full border rounded-lg bg-white"
              sandbox="allow-scripts allow-same-origin"
              title="Website Preview"
            />
          )}

          {/* Legacy: Static HTML preview (for backward compatibility) */}
          {!previewUrl && serverStatus === 'idle' && generatedCode && (
            <iframe
              key={key}
              ref={iframeRef}
              className="w-full h-full border rounded-lg bg-white"
              sandbox="allow-scripts allow-same-origin"
              title="Website Preview"
            />
          )}

          {/* No preview available */}
          {!previewUrl && serverStatus === 'idle' && !generatedCode && (
            <div className="flex items-center justify-center h-full border rounded-lg bg-muted/20">
              <div className="text-center space-y-2 text-muted-foreground">
                <Code className="h-12 w-12 mx-auto opacity-50" />
                <h3 className="text-lg font-semibold">No preview available</h3>
                <p className="text-sm">
                  Start a conversation to generate a website
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="code" className="flex-1 m-0 p-4 overflow-hidden">
          {generatedCode ? (
            <ScrollArea className="h-full w-full rounded-lg border">
              <SyntaxHighlighter
                language="html"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                {generatedCode}
              </SyntaxHighlighter>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-full border rounded-lg bg-muted/20">
              <div className="text-center space-y-2 text-muted-foreground">
                <Code className="h-12 w-12 mx-auto opacity-50" />
                <h3 className="text-lg font-semibold">No code generated</h3>
                <p className="text-sm">
                  The generated HTML code will appear here
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
