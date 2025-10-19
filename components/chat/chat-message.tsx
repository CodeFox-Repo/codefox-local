"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Loader2, Bot } from "lucide-react";
import { Response } from "@/components/response";
import { MessageActions } from "./message-actions";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  onRegenerate?: () => void;
  onEdit?: () => void;
}

export function ChatMessage({ role, content, isLoading = false, onRegenerate, onEdit }: ChatMessageProps) {
  const isUser = role === 'user';

  if (isUser) {
    // User message - simplified with small avatar, no background
    return (
      <div className="group flex items-start gap-3 py-2">
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

        <div className="shrink-0">
          <MessageActions content={content} role={role} onEdit={onEdit} />
        </div>
      </div>
    );
  }

  // Assistant message with bot avatar
  return (
    <div className="group py-2">
      <div className="flex items-start gap-3">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Bot className="h-3.5 w-3.5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
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

        {!isLoading && content && (
          <div className="shrink-0">
            <MessageActions content={content} role={role} onRegenerate={onRegenerate} />
          </div>
        )}
      </div>
    </div>
  );
}
