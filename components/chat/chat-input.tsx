"use client";

import { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "../ui/button";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  isLoading?: boolean;
  status?: "submitted" | "streaming" | "ready" | "error";
  onPause?: () => void;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  status: _status = "ready",
  onPause,
  placeholder = "Describe the website you want to create...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSubmit(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const isSubmitDisabled = !value.trim() || isLoading;
  const canStop = isLoading && onPause; // Show stop button whenever loading

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 pb-6 pt-0 min-w-0"
    >
      <div className="mx-auto w-full max-w-3xl pointer-events-auto">
        <div className="rounded-2xl border border-foreground/20 bg-background focus-within:border-foreground/30 transition-colors p-5 shadow-lg relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            aria-label="Chat message input"
            className="max-h-[120px] w-full resize-none border-0 px-0 py-0 bg-transparent text-sm leading-normal shadow-none focus-visible:ring-0 focus-visible:outline-none dark:bg-transparent disabled:opacity-60 disabled:cursor-not-allowed"
            rows={1}
          />

          <div className="absolute bottom-3 right-3">
            {canStop ? (
              <Button
                type="button"
                onClick={onPause}
                variant="ghost"
                size="icon"
                className="rounded-2xl h-8 w-8 text-destructive hover:bg-destructive/15 hover:text-destructive"
                aria-label="Stop generating response"
              >
                <Square className="h-3.5 w-3.5" fill="currentColor" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                variant="default"
                size="icon"
                className="rounded-2xl h-8 w-8"
                aria-label="Send message"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
