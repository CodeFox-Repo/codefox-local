"use client";

import { useEffect } from "react";
import { User, Bot, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { parseURLFromMessage, removeURLTag, cn } from "@/lib/utils";
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
        "flex gap-4 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          isUser
            ? "bg-primary text-gray-950"
            : "bg-gray-800 text-primary border border-gray-700"
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex-1 rounded-xl px-4 py-3 max-w-[85%]",
          isUser
            ? "bg-[var(--chat-user-bg)] text-foreground"
            : "bg-[var(--chat-ai-bg)] text-foreground border border-gray-800"
        )}
      >
        {/* Role label */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {isUser ? "You" : "Assistant"}
          </span>
          {!isUser && (
            <span className="text-xs text-gray-600">•</span>
          )}
          {!isUser && (
            <span className="text-xs text-gray-500">Claude Sonnet 4.5</span>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none">
          {isUser ? (
            <p className="text-foreground whitespace-pre-wrap">{displayContent}</p>
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
                        borderRadius: "0.5rem",
                        border: "1px solid var(--gray-800)",
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
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
                      className="text-primary hover:text-primary-hover inline-flex items-center gap-1"
                      {...props}
                    >
                      {children}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  );
                },
              }}
            >
              {displayContent}
            </ReactMarkdown>
          )}
        </div>

        {/* URL Action Button */}
        {url && (
          <button
            onClick={() => onOpenUrl?.(url)}
            className="mt-3 px-3 py-1.5 text-xs bg-primary hover:bg-primary-hover text-gray-950 rounded-lg font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Link
          </button>
        )}
      </div>
    </div>
  );
}
