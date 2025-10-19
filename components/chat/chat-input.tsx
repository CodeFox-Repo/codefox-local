"use client";

import { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  isLoading?: boolean;
  status?: 'submitted' | 'streaming' | 'ready' | 'error';
  onPause?: () => void;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  status = 'ready',
  onPause,
  placeholder = "Describe the website you want to create..."
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSubmit(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const isSubmitDisabled = !value.trim() || isLoading;
  const isStreaming = status === 'streaming';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-background px-4 pb-6 pt-4 min-w-0"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-gray-200 bg-muted  focus-within:border-primary/50 transition-colors pt-5 pb-2 px-5">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            aria-label="Chat message input"
            aria-describedby="chat-input-hint"
            className="max-h-[120px] w-full resize-none border-0 px-0 py-0 bg-transparent text-base leading-relaxed shadow-none focus-visible:ring-0 focus-visible:outline-none dark:bg-transparent disabled:opacity-60 disabled:cursor-not-allowed"
            rows={2}
          />

          <div className="flex items-center justify-between gap-2 bg-transparent mt-2">
            <span 
              id="chat-input-hint" 
              className="text-xs text-muted-foreground/70"
            >
              Press Enter to send, Shift+Enter for new line
            </span>
            <div className="flex items-center gap-2">
            {isStreaming && onPause && (
              <button
                type="button"
                onClick={onPause}
                aria-label="Stop generating response"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
              >
                <Square className="h-4 w-4" fill="currentColor" />
              </button>
            )}
            
            {!isStreaming && (
              <button
                type="submit"
                disabled={isSubmitDisabled}
                aria-label={isSubmitDisabled ? "Send message (disabled - enter text to enable)" : "Send message (Enter)"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/15 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
