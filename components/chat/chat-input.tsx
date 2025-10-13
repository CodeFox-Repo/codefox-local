"use client";

import { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp, StopCircle } from "lucide-react";

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

  const handleStop = () => {
    if (onPause) {
      onPause();
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

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t bg-background px-4 pb-6 pt-4 min-w-0"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="relative rounded-2xl border border-primary/30 bg-background/95 shadow-[0_12px_35px_rgba(0,0,0,0.08)]">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="max-h-[240px] min-h-[120px] w-full resize-none border-0 bg-transparent px-5 pb-16 pt-5 text-base leading-relaxed shadow-none focus-visible:ring-0 focus-visible:outline-none"
            rows={4}
          />

          {isLoading && onPause ? (
            <button
              type="button"
              onClick={handleStop}
              className="absolute bottom-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/30 focus:outline-none"
              title="Stop generation"
            >
              <StopCircle className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="absolute bottom-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/15 hover:text-primary focus:outline-none disabled:text-muted-foreground"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
          <div className="pointer-events-none absolute bottom-3 left-5 text-xs text-muted-foreground/80">
            <span>Enter to send • Shift + Enter for new line</span>
          </div>
        </div>
      </div>
    </form>
  );
}
