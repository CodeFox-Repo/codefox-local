"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Code, Eye, Loader2, XCircle, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useProjectStore } from "@/lib/store";
import { Input } from "@/components/ui/input";

interface RightPanelProps {
  generatedCode?: string;
}

export interface RightPanelRef {
  setUrl: (url: string) => void;
}

export const RightPanel = forwardRef<RightPanelRef, RightPanelProps>(
  ({ generatedCode = "" }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [key, setKey] = useState(0);
    const [showUrl, setShowUrl] = useState<string>("");
    const [inputUrl, setInputUrl] = useState<string>("");

    const devServer = useProjectStore((state) => state.devServer);
    const previewUrl = devServer.serverUrl;
    const serverStatus = devServer.status;

    useImperativeHandle(ref, () => ({
      setUrl: (url: string) => {
        setShowUrl(url);
        setInputUrl(url);
      }
    }));

  useEffect(() => {
    if (previewUrl) {
      setShowUrl(previewUrl);
      setInputUrl(previewUrl);
    }
  }, [previewUrl]);

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

  const handleUrlSubmit = () => {
    if (inputUrl.trim()) {
      setShowUrl(inputUrl.trim());
      setKey(prev => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
  };


  return (
    <Tabs defaultValue="preview" className="flex flex-col h-full gap-0">
      {/* Header: Tabs + Actions */}
      <div className="flex-shrink-0 flex items-center justify-between px-2 py-3.5 border-b">
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
      </div>

      {/* Body: Preview Tab */}
      <TabsContent value="preview" className="flex-1 m-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Address Bar */}
          <div className="flex-shrink-0 flex items-center gap-2 bg-muted/30 border-b px-5 py-2">
            <Globe className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <Input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a URL to preview"
              className="flex-1 border-0 bg-background rounded px-2 py-1 h-auto text-xs font-mono focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 placeholder:text-muted-foreground placeholder:font-sans"
              title={showUrl || 'Enter a URL'}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0 hover:bg-muted"
              onClick={handleRefresh}
              disabled={!showUrl}
              title="Refresh preview"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0 hover:bg-muted"
              onClick={() => window.open(showUrl!, '_blank')}
              disabled={!showUrl}
              title="Open in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Iframe Content */}
          <div className="flex-1 overflow-hidden bg-white">
            {serverStatus === 'starting' && (
              <div className="flex flex-col items-center justify-center h-full bg-muted/20">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-semibold">Starting dev server...</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This may take a few moments
                </p>
              </div>
            )}

            {serverStatus === 'error' && (
              <div className="flex flex-col items-center justify-center h-full bg-muted/20">
                <XCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-red-500">Failed to start dev server</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Check the command output for errors
                </p>
              </div>
            )}

            {showUrl && serverStatus !== 'starting' && (
              <iframe
                key={key}
                src={showUrl}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="Website Preview"
              />
            )}

            {!showUrl && serverStatus === 'idle' && generatedCode && (
              <iframe
                key={key}
                ref={iframeRef}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="Website Preview"
              />
            )}

            {!showUrl && serverStatus === 'idle' && !generatedCode && (
              <div className="flex items-center justify-center h-full bg-muted/20">
                <div className="text-center space-y-2 text-muted-foreground">
                  <Code className="h-12 w-12 mx-auto opacity-50" />
                  <h3 className="text-lg font-semibold">No preview available</h3>
                  <p className="text-sm">
                    Start a conversation to generate a website or enter a URL
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      {/* Body: Code Tab */}
      <TabsContent value="code" className="flex-1 m-0 overflow-hidden data-[state=active]:flex data-[state=active]:w-full bg-white">
        {generatedCode ? (
          <ScrollArea className="flex-1 w-full bg-white">
            <SyntaxHighlighter
              language="html"
              style={oneDark}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: '0.875rem',
                minHeight: '100%',
              }}
            >
              {generatedCode}
            </SyntaxHighlighter>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted/20">
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
  );
});

RightPanel.displayName = "RightPanel";
