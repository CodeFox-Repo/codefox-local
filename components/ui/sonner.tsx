"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(var(--primary))",
          "--success-border": "hsl(var(--primary))",
          "--success-text": "hsl(var(--primary-foreground))",
          "--error-bg": "hsl(var(--destructive))",
          "--error-border": "hsl(var(--destructive))",
          "--error-text": "hsl(var(--destructive-foreground))",
          "--warning-bg": "hsl(var(--primary))",
          "--warning-border": "hsl(var(--primary))",
          "--warning-text": "hsl(var(--primary-foreground))",
          "--info-bg": "hsl(var(--primary))",
          "--info-border": "hsl(var(--primary))",
          "--info-text": "hsl(var(--primary-foreground))",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
