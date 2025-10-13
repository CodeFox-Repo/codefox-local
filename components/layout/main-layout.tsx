"use client";

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface MainLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function MainLayout({ leftPanel, rightPanel }: MainLayoutProps) {
  return (
    <div className="h-screen w-full bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={40} minSize={40} maxSize={50}>
          <div className="h-full overflow-hidden min-w-0">
            {leftPanel}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60} minSize={50} maxSize={70}>
          <div className="h-full overflow-hidden min-w-0">
            {rightPanel}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
