import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UIMessage } from 'ai';

interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  createdAt: Date;
}

// Project snapshot - saves complete state of a project at a specific moment
interface ProjectSnapshot {
  // Project basic info
  project: ProjectInfo;
  lastAccessedAt: Date;

  // Chat state snapshot
  messages: UIMessage[];

  // Preview state snapshot
  iframeUrl: string;
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
  iframeUrl: string;

  // Actions - Project Management
  setCurrentProject: (project: ProjectInfo) => void;
  switchToProject: (projectId: string) => void;
  saveCurrentSnapshot: () => void;
  removeFromHistory: (projectId: string) => void;
  clearHistory: () => void;

  // Helper - get project history list (sorted by last accessed time)
  getProjectHistory: () => ProjectSnapshot[];
  getCurrentProject: () => ProjectInfo | null;

  // Actions - Chat
  setInput: (input: string) => void;
  setMessages: (messages: UIMessage[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearMessages: () => void;

  // Actions - Iframe
  setIframeUrl: (url: string) => void;
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
      iframeUrl: '',

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
            iframeUrl: existingSnapshot.iframeUrl,
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
            iframeUrl: '',
            projectSnapshots: {
              ...get().projectSnapshots,
              [project.id]: {
                project,
                lastAccessedAt: new Date(),
                messages: [],
                iframeUrl: '',
              },
            },
          });
        }

      },

      switchToProject: (projectId: string) => {
        const snapshot = get().projectSnapshots[projectId];
        if (!snapshot) {
          console.warn('Project snapshot not found:', projectId);
          return;
        }

        // Save current project snapshot first
        const currentId = get().currentProjectId;
        if (currentId) {
          get().saveCurrentSnapshot();
        }

        // Switch to target project and restore its state
        set({
          currentProjectId: projectId,
          messages: snapshot.messages,
          iframeUrl: snapshot.iframeUrl,
          projectSnapshots: {
            ...get().projectSnapshots,
            [projectId]: {
              ...snapshot,
              lastAccessedAt: new Date(),
            },
          },
        });
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
              iframeUrl: get().iframeUrl,
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
            iframeUrl: '',
          });
        }
      },

      clearHistory: () => {
        set({
          projectSnapshots: {},
          currentProjectId: null,
          messages: [],
          iframeUrl: '',
        });
      },

      getProjectHistory: () => {
        const snapshots = Object.values(get().projectSnapshots);
        return snapshots.sort(
          (a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime()
        );
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

      // Iframe Actions
      setIframeUrl: (iframeUrl: string) => {
        set({ iframeUrl });
        // Auto-save snapshot
        const currentId = get().currentProjectId;
        if (currentId) {
          setTimeout(() => get().saveCurrentSnapshot(), 100);
        }
      },
    }),
    {
      name: 'codefox-project-storage',
      partialize: (state) => ({
        // Only persist project snapshots and current project ID
        projectSnapshots: state.projectSnapshots,
        currentProjectId: state.currentProjectId,
        // Don't persist real-time state (messages, input, isLoading, iframeUrl)
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
