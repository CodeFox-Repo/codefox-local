"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Code, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface IframeContainerProps {
  generatedCode: string;
}

export function IframeContainer({ generatedCode }: IframeContainerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState(0);

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
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Preview</h2>
            <p className="text-sm text-muted-foreground">
              Live preview of your generated website
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={!generatedCode}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              disabled={!generatedCode}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="preview" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="h-4 w-4 mr-2" />
              Code
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="flex-1 m-0 p-4 overflow-hidden">
          {generatedCode ? (
            <iframe
              key={key}
              ref={iframeRef}
              className="w-full h-full border rounded-lg bg-white"
              sandbox="allow-scripts allow-same-origin"
              title="Website Preview"
            />
          ) : (
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
