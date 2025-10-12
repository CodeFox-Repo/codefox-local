"use client";

import { useState } from "react";
import { History, Trash2, FolderOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjectStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";

export function ProjectHistory() {
  const [open, setOpen] = useState(false);
  const {
    getProjectHistory,
    currentProjectId,
    switchToProject,
    removeFromHistory,
    clearHistory,
  } = useProjectStore();

  const projectHistory = getProjectHistory();

  const handleSelectProject = (snapshot: ReturnType<typeof getProjectHistory>[0]) => {
    switchToProject(snapshot.project.id);
    setOpen(false);
  };

  const handleRemove = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromHistory(projectId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Project History">
          <History className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Project History</span>
            {projectHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Clear All
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {projectHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">No projects yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a project to see it here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {projectHistory.map((snapshot) => {
                const isActive = currentProjectId === snapshot.project.id;
                const lastAccessed = new Date(snapshot.lastAccessedAt);

                return (
                  <div
                    key={snapshot.project.id}
                    className={`group relative flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isActive
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50 border-border"
                    }`}
                    onClick={() => handleSelectProject(snapshot)}
                  >
                    <FolderOpen
                      className={`h-5 w-5 flex-shrink-0 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-medium text-sm truncate ${
                            isActive ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {snapshot.project.name}
                        </p>
                        {isActive && (
                          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {snapshot.project.path}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(lastAccessed, { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleRemove(snapshot.project.id, e)}
                      title="Remove from history"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
