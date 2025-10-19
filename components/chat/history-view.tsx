"use client";

import { useState, useEffect } from "react";
import { Code, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";

interface HistoryViewProps {
  onBack?: () => void;
  onSelectProject?: () => void;
}

export function HistoryView({ onBack, onSelectProject }: HistoryViewProps) {
  const [mounted, setMounted] = useState(false);
  const { getProjectHistory, switchToProject } = useProjectStore();
  const allProjects = mounted ? getProjectHistory() : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-start justify-center h-full p-6 overflow-auto">
      <div className="w-full max-w-3xl space-y-4">
        <div className="flex items-center gap-1">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-xl font-bold">Project History</h2>
        </div>

        {allProjects.length === 0 ? (
          <Card className="shadow-none border border-foreground/20 p-8 text-center">
            <Code className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No projects yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first project to get started
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {allProjects.map((snapshot) => {
              const label = snapshot.project.title ?? snapshot.project.name;
              const lastAccessed = new Date(snapshot.lastAccessedAt);

              return (
                <Card
                  key={snapshot.project.id}
                  className="shadow-none border border-foreground/20 p-3 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all group"
                  onClick={() => {
                    switchToProject(snapshot.project.id);
                    onSelectProject?.();
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-1.5 rounded bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                        <Code className="h-4 w-4 text-primary" />
                      </div>
                      <p className="font-semibold text-sm truncate">
                        {label}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(lastAccessed, { addSuffix: true })}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
