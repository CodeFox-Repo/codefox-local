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
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <div className="h-full overflow-hidden">
            {leftPanel}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} minSize={50} maxSize={80}>
          <div className="h-full overflow-hidden">
            {rightPanel}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
