"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";
import { CodeBlock } from "@/components/chat/code-block";

type ResponseProps = ComponentProps<typeof Streamdown>;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        // Improved styles for markdown elements
        "[&_table]:w-full [&_table]:border-collapse [&_table]:my-4",
        "[&_th]:border [&_th]:px-4 [&_th]:py-2 [&_th]:bg-muted [&_th]:font-semibold [&_th]:text-left",
        "[&_td]:border [&_td]:px-4 [&_td]:py-2",
        "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:space-y-1",
        "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2 [&_ol]:space-y-1",
        "[&_li]:leading-relaxed",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary/80 [&_a]:transition-colors",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground",
        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4",
        "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3",
        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2",
        "[&_p]:leading-relaxed [&_p]:my-2",
        "[&_code]:text-sm [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono",
        "[&_pre]:my-0",
        className
      )}
      components={{
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : 'text';
          const isInline = !match;
          
          if (isInline) {
            return (
              <code className={cn("text-sm bg-muted px-1.5 py-0.5 rounded font-mono", className)} {...props}>
                {children}
              </code>
            );
          }
          
          return (
            <CodeBlock language={language} showLineNumbers={true}>
              {String(children).replace(/\n$/, '')}
            </CodeBlock>
          );
        },
      }}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
