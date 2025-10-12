"use client";

import { useState } from "react";
import { RefreshCw, ExternalLink, Globe, AlertCircle, ArrowRight } from "lucide-react";
import { isValidURL, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";

interface IframeContainerProps {
  url: string;
  onUrlChange: (url: string) => void;
}

export function IframeContainer({ url, onUrlChange }: IframeContainerProps) {
  const [inputUrl, setInputUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    let finalUrl = inputUrl.trim();

    // Add protocol if missing
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    if (isValidURL(finalUrl)) {
      setError(null);
      onUrlChange(finalUrl);
    } else {
      setError("Invalid URL format");
    }
  };

  const handleReload = () => {
    if (url) {
      setIsLoading(true);
      // Trigger reload by changing key
      onUrlChange(url + "?reload=" + Date.now());
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError("Failed to load the URL");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with URL controls */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-center size-9 rounded-lg bg-muted">
          <Globe className="size-4 text-muted-foreground" />
        </div>

        <form onSubmit={handleUrlSubmit} className="flex-1 flex gap-2">
          <Input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter URL or ask AI to open a website..."
            className="rounded-xl"
          />
          <Button type="submit" size="sm" className="gap-1.5">
            <ArrowRight />
            Go
          </Button>
        </form>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleReload}
            disabled={!url}
            title="Reload"
          >
            <RefreshCw className={cn(isLoading && "animate-spin")} />
          </Button>

          {url && (
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              title="Open in new tab"
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="m-4 rounded-xl">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* iframe or empty state */}
      <div className="flex-1 relative bg-white">
        {url ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="size-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading website...</p>
                </div>
              </div>
            )}
            <iframe
              key={url}
              src={url}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="no-referrer"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Preview"
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-background">
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="size-16 mb-2">
                  <Globe className="size-8" />
                </EmptyMedia>
                <EmptyTitle className="text-2xl">Web Preview</EmptyTitle>
                <EmptyDescription>
                  Enter a URL above or ask the AI assistant to open a website for you.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex flex-row gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInputUrl("google.com");
                      onUrlChange("https://google.com");
                    }}
                  >
                    🔍 Google
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInputUrl("github.com");
                      onUrlChange("https://github.com");
                    }}
                  >
                    💻 GitHub
                  </Button>
                </div>
              </EmptyContent>
            </Empty>
          </div>
        )}
      </div>
    </div>
  );
}
