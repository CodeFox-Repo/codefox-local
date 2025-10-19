"use client";

import { useState, useEffect } from "react";
import { Sparkles, Rocket, Code, Palette, History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
  onShowHistory?: () => void;
  onSelectProject?: () => void;
}

const EXAMPLE_PROMPTS = [
  {
    icon: Palette,
    title: "Landing Page",
    prompt: "Create a modern landing page for a SaaS product with a hero section, features, and pricing"
  },
  {
    icon: Code,
    title: "Portfolio",
    prompt: "Build a personal portfolio website with sections for about, projects, and contact"
  },
  {
    icon: Sparkles,
    title: "Dashboard",
    prompt: "Create an analytics dashboard with charts, stats cards, and data tables"
  }
];

export function WelcomeScreen({ onPromptClick, onShowHistory, onSelectProject }: WelcomeScreenProps) {
  const [mounted, setMounted] = useState(false);
  const { getProjectHistory, switchToProject } = useProjectStore();
  const allProjects = mounted ? getProjectHistory() : [];
  const recentProjects = allProjects.slice(0, 5);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Welcome View
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Codefox</h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Build beautiful websites with AI. Describe your vision and watch it come to life.
          </p>
        </div>

        {/* Recent Projects or Example Prompts */}
        {allProjects.length > 0 ? (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Recent Projects
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {recentProjects.map((snapshot) => {
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

            {/* View All Projects Link */}
            {allProjects.length > 5 && onShowHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowHistory}
                className="w-full mt-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <History className="h-3.5 w-3.5 mr-1.5" />
                View all projects ({allProjects.length})
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Try These Examples
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {EXAMPLE_PROMPTS.map((example, index) => {
                const Icon = example.icon;
                return (
                  <Card
                    key={index}
                    className="shadow-none border border-foreground/20 p-3 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all group"
                    onClick={() => onPromptClick(example.prompt)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm mb-0.5">{example.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {example.prompt}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Start Guide - only show when no history */}
        {allProjects.length === 0 && (
          <Card className="shadow-none border border-foreground/20 p-4 bg-muted/30 border-dashed">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Quick Start Guide
              </h3>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-medium flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px]">
                      1
                    </span>
                    <span className="text-xs">Describe</span>
                  </div>
                  <p className="text-muted-foreground text-[10px] leading-relaxed">
                    Tell me what you want to build
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-medium flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px]">
                      2
                    </span>
                    <span className="text-xs">Watch</span>
                  </div>
                  <p className="text-muted-foreground text-[10px] leading-relaxed">
                    See it built in real-time
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-medium flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px]">
                      3
                    </span>
                    <span className="text-xs">Refine</span>
                  </div>
                  <p className="text-muted-foreground text-[10px] leading-relaxed">
                    Request improvements
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

