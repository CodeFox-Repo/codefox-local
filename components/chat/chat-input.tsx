"use client";

import { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp } from "lucide-react";

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
            className="max-h-[120px] w-full resize-none border-0 px-0 py-0 bg-transparent text-base leading-relaxed shadow-none focus-visible:ring-0 focus-visible:outline-none dark:bg-transparent"
            rows={2}
          />

          <div className="flex items-center justify-end bg-transparent">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/15 hover:text-primary focus:outline-none disabled:text-muted-foreground"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
