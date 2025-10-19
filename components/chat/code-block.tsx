"use client";

import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

interface CodeBlockProps {
  language?: string;
  children: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ language = "text", children, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <div className="group relative my-4 rounded-lg overflow-hidden border bg-muted/30">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={isDark ? oneDark : oneLight}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.875rem",
          }}
          lineNumberStyle={{
            minWidth: "3em",
            paddingRight: "1em",
            color: "var(--color-muted-foreground)",
            opacity: 0.5,
            userSelect: "none",
          }}
        >
          {children.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

