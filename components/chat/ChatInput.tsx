"use client";

import { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, StopCircle } from "lucide-react";

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

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background min-w-0">
      <div className="flex gap-2 items-start min-w-0">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="max-h-[200px] resize-none min-w-0 flex-1"
          rows={2}
        />
        {isLoading && onPause ? (
          <Button
            type="button"
            onClick={handleStop}
            variant="destructive"
            size="icon"
            className="h-14.5 w-11 shrink-0"
            title="Stop Generation"
          >
            <StopCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!value.trim() || isLoading}
            size="icon"
            className="h-14.5 w-11 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift + Enter for new line
      </p>
    </form>
  );
}
