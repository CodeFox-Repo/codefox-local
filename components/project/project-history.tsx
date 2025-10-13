"use client";

import { useState } from "react";
import { History, Trash2, FolderOpen, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
      <DialogContent className="sm:max-w-[600px]" showCloseButton={false}>
        <DialogHeader className="flex-row items-center justify-between space-y-0">
          <DialogTitle>Project History</DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
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

                // Extract project ID from path for display
                const projectId = snapshot.project.id;

                // Determine display path based on path format
                let displayPath: string;
                if (!snapshot.project.path || snapshot.project.path === 'browser-storage') {
                  // Legacy or invalid data - just show project ID
                  displayPath = projectId;
                } else if (snapshot.project.path.includes('.codefox-local/projects')) {
                  // Correct new format - show just project ID
                  displayPath = projectId;
                } else if (snapshot.project.path.includes('.projects')) {
                  // Old wrong format - extract project ID from path
                  const match = snapshot.project.path.match(/project-\d+/);
                  displayPath = match ? match[0] : projectId;
                } else {
                  // Unknown format - show full path
                  displayPath = snapshot.project.path;
                }

                return (
                  <div
                    key={snapshot.project.id}
                    className={`group relative flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "hover:bg-muted/50 hover:shadow-sm border-border"
                    }`}
                    onClick={() => handleSelectProject(snapshot)}
                  >
                    <div
                      className={`p-2 rounded-md flex-shrink-0 ${
                        isActive ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      <FolderOpen
                        className={`h-4 w-4 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p
                          className={`font-semibold text-sm truncate ${
                            isActive ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {snapshot.project.name}
                        </p>
                        {isActive && (
                          <span className="text-[10px] font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full flex-shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground/70 font-mono truncate mb-2 bg-muted/30 px-2 py-1 rounded">
                        {displayPath}
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <span className="opacity-70">Last accessed</span>
                        <span className="font-medium">
                          {formatDistanceToNow(lastAccessed, { addSuffix: true })}
                        </span>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => handleRemove(snapshot.project.id, e)}
                      title="Remove from history"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
