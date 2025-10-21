import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UIMessage } from 'ai';

interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  createdAt: Date;
  title?: string;
}

// Project snapshot - saves complete state of a project at a specific moment
interface ProjectSnapshot {
  // Project basic info
  project: ProjectInfo;
  lastAccessedAt: Date;

  // Chat state snapshot
  messages: UIMessage[];
}

// Dev server state
interface DevServerState {
  projectId: string | null;
  serverUrl: string | null;
  pid: number | null;
  status: 'idle' | 'starting' | 'running' | 'error';
}

interface ProjectGeneratorStore {
  // Current active project ID
  currentProjectId: string | null;

  // Project history - each project saves complete state snapshot
  projectSnapshots: Record<string, ProjectSnapshot>;  // key = projectId

  // Current project's real-time state (not persisted to localStorage)
  messages: UIMessage[];
  input: string;
  isLoading: boolean;

  // Dev server state - automatically managed
  devServer: DevServerState;

  // Actions - Project Management
  setCurrentProject: (project: ProjectInfo) => void;
  switchToProject: (projectId: string) => void;
  saveCurrentSnapshot: () => void;
  removeFromHistory: (projectId: string) => void;
  clearHistory: () => void;
  setProjectTitle: (projectId: string, title: string | null) => void;

  // Helper - get project history list (sorted by last accessed time)
  getProjectHistory: () => ProjectSnapshot[];
  getCurrentProject: () => ProjectInfo | null;

  // Actions - Chat
  setInput: (input: string) => void;
  setMessages: (messages: UIMessage[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearMessages: () => void;

  // Actions - Dev Server
  setDevServer: (projectId: string, url: string, pid: number) => void;
  clearDevServer: () => void;
  setDevServerStatus: (status: DevServerState['status']) => void;
}

export const useProjectStore = create<ProjectGeneratorStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProjectId: null,
      projectSnapshots: {},
      messages: [],
      input: '',
      isLoading: false,
      devServer: {
        projectId: null,
        serverUrl: null,
        pid: null,
        status: 'idle',
      },

      // Project Management Actions
      setCurrentProject: (project: ProjectInfo) => {
        // Save current project snapshot first (if exists)
        const currentId = get().currentProjectId;
        if (currentId) {
          get().saveCurrentSnapshot();
        }

        // Set new current project
        set({ currentProjectId: project.id });

        // Check if snapshot already exists for this project
        const existingSnapshot = get().projectSnapshots[project.id];

        if (existingSnapshot) {
          // Restore project state
          set({
            messages: existingSnapshot.messages,
            projectSnapshots: {
              ...get().projectSnapshots,
              [project.id]: {
                ...existingSnapshot,
                lastAccessedAt: new Date(),
              },
            },
          });
        } else {
          // New project, clear state
          set({
            messages: [],
            projectSnapshots: {
              ...get().projectSnapshots,
              [project.id]: {
                project,
                lastAccessedAt: new Date(),
                messages: [],
              },
            },
          });
        }

      },

      switchToProject: (projectId: string) => {
        const snapshot = get().projectSnapshots[projectId];
        if (!snapshot) {
          console.warn('[Store] Project snapshot not found:', projectId);
          return;
        }


        // Save current project snapshot first
        const currentId = get().currentProjectId;
        if (currentId && currentId !== projectId) {
          get().saveCurrentSnapshot();
        }

        // Clear dev server state when switching projects
        // It will be auto-detected by useDevServerMonitor from restored messages
        get().clearDevServer();

        // Switch to target project and restore its state
        set({
          currentProjectId: projectId,
          messages: snapshot.messages,
          projectSnapshots: {
            ...get().projectSnapshots,
            [projectId]: {
              ...snapshot,
              lastAccessedAt: new Date(),
            },
          },
        });
        console.log('[Store] Project switched successfully');
      },

      saveCurrentSnapshot: () => {
        const currentId = get().currentProjectId;
        if (!currentId) return;

        const currentSnapshot = get().projectSnapshots[currentId];
        if (!currentSnapshot) return;

        set({
          projectSnapshots: {
            ...get().projectSnapshots,
            [currentId]: {
              ...currentSnapshot,
              messages: get().messages,
              lastAccessedAt: new Date(),
            },
          },
        });

      },

      removeFromHistory: (projectId: string) => {
        const newSnapshots = { ...get().projectSnapshots };
        delete newSnapshots[projectId];

        set({ projectSnapshots: newSnapshots });

        // If deleting current project, clear current state
        if (get().currentProjectId === projectId) {
          set({
            currentProjectId: null,
            messages: [],
          });
        }
      },

      clearHistory: () => {
        set({
          projectSnapshots: {},
          currentProjectId: null,
          messages: [],
        });
      },

      setProjectTitle: (projectId: string, title: string | null) => {
        const snapshot = get().projectSnapshots[projectId];
        if (!snapshot) {
          return;
        }

        const updatedSnapshot: ProjectSnapshot = {
          ...snapshot,
          project: {
            ...snapshot.project,
            title: title ?? undefined,
          },
        };

        set({
          projectSnapshots: {
            ...get().projectSnapshots,
            [projectId]: updatedSnapshot,
          },
        });
      },

      getProjectHistory: () => {
        const snapshots = Object.values(get().projectSnapshots);
        const toTime = (value: Date | string) => {
          const ms = value instanceof Date ? value.getTime() : new Date(value).getTime();
          return Number.isNaN(ms) ? 0 : ms;
        };

        return snapshots.sort((a, b) => toTime(b.project.createdAt) - toTime(a.project.createdAt));
      },

      getCurrentProject: () => {
        const currentId = get().currentProjectId;
        if (!currentId) return null;

        const snapshot = get().projectSnapshots[currentId];
        return snapshot ? snapshot.project : null;
      },

      // Chat Actions
      setInput: (input: string) => set({ input }),

      setMessages: (messages: UIMessage[]) => {
        set({ messages });
        // Auto-save snapshot
        const currentId = get().currentProjectId;
        if (currentId) {
          setTimeout(() => get().saveCurrentSnapshot(), 100);
        }
      },

      setIsLoading: (isLoading: boolean) => set({ isLoading }),

      clearMessages: () => set({ messages: [] }),

      // Dev Server Actions
      setDevServer: (projectId: string, url: string, pid: number) => {
        set({
          devServer: {
            projectId,
            serverUrl: url,
            pid,
            status: 'running',
          },
        });
      },

      clearDevServer: () => {
        set({
          devServer: {
            projectId: null,
            serverUrl: null,
            pid: null,
            status: 'idle',
          },
        });
      },

      setDevServerStatus: (status: DevServerState['status']) => {
        set((state) => ({
          devServer: {
            ...state.devServer,
            status,
          },
        }));
      },
    }),
    {
      name: 'codefox-project-storage',
      partialize: (state) => ({
        // Only persist project snapshots
        projectSnapshots: state.projectSnapshots,
        // Don't persist real-time state (messages, input, isLoading)
      }),
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          const parsed = JSON.parse(str);

          // Convert date strings back to Date objects in projectSnapshots
          if (parsed.state?.projectSnapshots) {
            Object.keys(parsed.state.projectSnapshots).forEach((projectId) => {
              const snapshot = parsed.state.projectSnapshots[projectId];

              // Convert lastAccessedAt
              if (snapshot.lastAccessedAt) {
                snapshot.lastAccessedAt = new Date(snapshot.lastAccessedAt);
              }

              // Convert project.createdAt
              if (snapshot.project?.createdAt) {
                snapshot.project.createdAt = new Date(snapshot.project.createdAt);
              }
            });
          }

          return JSON.stringify(parsed);
        },
        setItem: (name, value) => {
          localStorage.setItem(name, value);
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      })),
    }
  )
);
