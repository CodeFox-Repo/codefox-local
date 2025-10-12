"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Bot, Loader2 } from "lucide-react";
import { Response } from "@/components/ai-elements/response";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

export function ChatMessage({ role, content, isLoading = false }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg",
      isUser ? "bg-muted/50" : "bg-background"
    )}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 overflow-hidden space-y-2">
        <div className="font-semibold text-sm flex items-center gap-2">
          {isUser ? "You" : "Assistant"}
          {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
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
    </div>
  );
}
