"use client";

import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Kbd } from "@/components/ui/kbd";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-6 border-t border-border">
      <div className="relative flex items-end gap-2">
        <Textarea
          value={input}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Message CodeFox..."
          disabled={isLoading}
          rows={1}
          className={cn(
            "resize-none rounded-2xl pr-14 min-h-[52px] max-h-[200px]"
          )}
        />

        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 bottom-2 rounded-xl"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-3 px-1 flex items-center gap-1.5">
        <span>Press</span>
        <Kbd>⌘</Kbd>
        <span>+</span>
        <Kbd>Enter</Kbd>
        <span>to send</span>
      </p>
    </form>
  );
}
