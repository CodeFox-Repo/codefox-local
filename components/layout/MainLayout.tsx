"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function MainLayout({ leftPanel, rightPanel }: MainLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(40); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 25% and 75%
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 25), 75);
      setLeftWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-screen bg-background overflow-hidden"
    >
      {/* Left Panel - Chat */}
      <div
        className="flex-shrink-0 border-r border-gray-800"
        style={{ width: `${leftWidth}%` }}
      >
        {leftPanel}
      </div>

      {/* Resizer */}
      <div
        className={cn(
          "w-1 cursor-col-resize bg-gray-800 hover:bg-primary transition-colors relative group",
          isDragging && "bg-primary"
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Visual indicator */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Right Panel - iframe */}
      <div className="flex-1 overflow-hidden">
        {rightPanel}
      </div>
    </div>
  );
}
