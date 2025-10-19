"use client";

import { useState } from "react";
import { Copy, Check, RotateCw, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MessageActionsProps {
  content: string;
  onRegenerate?: () => void;
  onEdit?: () => void;
  role: 'user' | 'assistant';
}

export function MessageActions({ content, onRegenerate, onEdit, role }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-7 px-2"
        title="Copy message"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>

      {role === 'assistant' && onRegenerate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          className="h-7 px-2"
          title="Regenerate response"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </Button>
      )}

      {role === 'user' && onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 px-2"
          title="Edit message"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

