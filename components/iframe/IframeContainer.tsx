"use client";

import { useState } from "react";
import { RefreshCw, ExternalLink, Globe, AlertCircle, ArrowRight } from "lucide-react";
import { cn, isValidURL } from "@/lib/utils";

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
    <div className="flex flex-col h-full bg-[var(--iframe-bg)]">
      {/* Header with URL controls */}
      <div className="flex items-center gap-4 px-8 py-5 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
          <Globe className="w-5 h-5 text-primary" />
        </div>

        <form onSubmit={handleUrlSubmit} className="flex-1 flex gap-3">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter URL or ask AI to open a website..."
            className={cn(
              "flex-1 px-5 py-3 rounded-xl text-sm",
              "bg-[var(--input-bg)] border border-[var(--input-border)]",
              "text-foreground placeholder:text-gray-500",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
              "transition-all duration-200 shadow-sm"
            )}
          />
          <button
            type="submit"
            className="px-5 py-3 bg-primary hover:bg-primary-hover active:scale-95 text-gray-950 rounded-xl font-medium transition-all text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Go
          </button>
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            disabled={!url}
            className="p-2.5 hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reload"
          >
            <RefreshCw className={cn("w-5 h-5 text-gray-400", isLoading && "animate-spin")} />
          </button>

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 hover:bg-gray-800 rounded-xl transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-8 py-4 bg-red-950/30 border-b border-red-900/50 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* iframe or empty state */}
      <div className="flex-1 relative bg-white">
        {url ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-950/50 z-10 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm text-gray-400">Loading website...</p>
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
          <div className="flex items-center justify-center h-full bg-gray-950">
            <div className="text-center space-y-6 max-w-lg px-6">
              <div className="relative">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <Globe className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  Web Preview
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Enter a URL above or ask the AI assistant to open a website for you.
                  <br />
                  Browse the web right here!
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <button
                  onClick={() => {
                    setInputUrl("google.com");
                    onUrlChange("https://google.com");
                  }}
                  className="px-5 py-2.5 text-sm bg-gray-800/50 hover:bg-gray-800 rounded-xl text-gray-300 transition-all hover:scale-105 border border-gray-700/50 flex items-center gap-2"
                >
                  <span>🔍</span>
                  Google
                </button>
                <button
                  onClick={() => {
                    setInputUrl("github.com");
                    onUrlChange("https://github.com");
                  }}
                  className="px-5 py-2.5 text-sm bg-gray-800/50 hover:bg-gray-800 rounded-xl text-gray-300 transition-all hover:scale-105 border border-gray-700/50 flex items-center gap-2"
                >
                  <span>💻</span>
                  GitHub
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
