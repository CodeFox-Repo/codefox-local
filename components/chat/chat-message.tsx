"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Loader2 } from "lucide-react";
import { Response } from "@/components/response";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

export function ChatMessage({ role, content, isLoading = false }: ChatMessageProps) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex items-start gap-3 py-2">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User className="h-3.5 w-3.5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 mt-0.5 leading-tight">
          <Response className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 break-words leading-tight [&>p]:mt-0 [&>p]:leading-tight [&>*+*]:mt-3">
            {content}
          </Response>
        </div>
      </div>
    );
  }

  // Assistant message - no avatar
  return (
    <div className="py-2">
      {isLoading && !content ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Thinking...</span>
        </div>
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
          <Response>{content}</Response>
        </div>
      )}
    </div>
  );
}
