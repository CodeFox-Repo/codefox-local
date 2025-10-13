"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Loader2 } from "lucide-react";
import { Response } from "@/components/ai-elements/response";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

export function ChatMessage({ role, content, isLoading = false }: ChatMessageProps) {
  const isUser = role === 'user';

  if (isUser) {
    // User message - simplified with small avatar, no background
    return (
      <div className="flex gap-3 py-3">
        <Avatar className="h-6 w-6 shrink-0 mt-0.5">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User className="h-3 w-3" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 break-words">
            <Response>{content}</Response>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message without avatar, just text
  return (
    <div className="py-3">
      <div className="prose prose-sm dark:prose-invert max-w-none break-words">
        {isLoading && !content ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        ) : (
          <Response>{content}</Response>
        )}
      </div>
    </div>
  );
}
