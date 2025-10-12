"use client";

import { useEffect } from "react";
import { User, Bot, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { parseURLFromMessage, removeURLTag, cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
  onOpenUrl?: (url: string) => void;
}

export function ChatMessage({ message, onOpenUrl }: ChatMessageProps) {
  const isUser = message.role === "user";
  const url = parseURLFromMessage(message.content);
  const displayContent = removeURLTag(message.content);

  useEffect(() => {
    if (url && message.role === "assistant" && onOpenUrl) {
      onOpenUrl(url);
    }
  }, [url, message.role, onOpenUrl]);

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(
        "shrink-0",
        isUser ? "bg-primary" : "bg-muted border"
      )}>
        <AvatarFallback className={cn(
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className="flex-1 max-w-[75%] space-y-1.5">
        {/* Role label */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? "You" : "CodeFox"}
          </span>
          {!isUser && (
            <>
              <span className="text-xs text-muted-foreground/50">•</span>
              <Badge variant="secondary" className="text-[10px] py-0 h-4">
                AI
              </Badge>
            </>
          )}
        </div>

        <div
          className={cn(
            "rounded-2xl px-4 py-3 transition-all border",
            isUser
              ? "bg-muted/50 border-border/50"
              : "bg-muted/30 border-border/30"
          )}
        >
          {/* Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {isUser ? (
              <p className="text-foreground whitespace-pre-wrap m-0 leading-relaxed">{displayContent}</p>
            ) : (
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: "0.5em 0",
                          borderRadius: "0.75rem",
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--muted))",
                          padding: "1em",
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-primary text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  a({ href, children, ...props }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 inline-flex items-center gap-1 underline underline-offset-2 decoration-primary/40"
                        {...props}
                      >
                        {children}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-2 last:mb-0 leading-relaxed text-foreground">{children}</p>;
                  },
                }}
              >
                {displayContent}
              </ReactMarkdown>
            )}
          </div>

          {/* URL Action Button */}
          {url && (
            <Button
              size="sm"
              onClick={() => onOpenUrl?.(url)}
              className="mt-3"
            >
              <ExternalLink />
              Open Link
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
