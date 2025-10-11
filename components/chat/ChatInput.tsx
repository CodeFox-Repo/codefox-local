"use client";

import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <form onSubmit={onSubmit} className="p-6">
      <div className="relative flex items-end gap-3">
        <textarea
          value={input}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Message CodeFox..."
          disabled={isLoading}
          rows={1}
          className={cn(
            "flex-1 resize-none rounded-2xl px-5 py-4 pr-14",
            "bg-[var(--input-bg)] border border-[var(--input-border)]",
            "text-foreground placeholder:text-gray-500 text-sm",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200",
            "max-h-[200px] overflow-y-auto shadow-lg"
          )}
          style={{
            minHeight: "56px",
            height: "auto",
          }}
        />

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={cn(
            "absolute right-9 bottom-9 p-2.5 rounded-xl",
            "bg-primary hover:bg-primary-hover active:scale-95",
            "text-gray-950 font-medium shadow-lg shadow-primary/20",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
            "transition-all duration-200",
            "flex items-center justify-center"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className="text-xs text-gray-600 mt-3 px-2 flex items-center gap-2">
        <span>Press</span>
        <kbd className="px-2 py-1 bg-gray-800/50 rounded-md text-gray-400 border border-gray-700 font-mono text-xs">⌘</kbd>
        <span className="text-gray-700">+</span>
        <kbd className="px-2 py-1 bg-gray-800/50 rounded-md text-gray-400 border border-gray-700 font-mono text-xs">Enter</kbd>
        <span>to send</span>
      </p>
    </form>
  );
}
