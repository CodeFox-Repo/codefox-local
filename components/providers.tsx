'use client';

import { ThemeProvider } from "@/components/theme-provider";
import { SandpackProvider } from "@codesandbox/sandpack-react";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SandpackProvider
        template="react-ts"
        theme="dark"
      >
        {children}
      </SandpackProvider>
    </ThemeProvider>
  );
}

