import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  createdAt: Date;
}

interface ProjectGeneratorStore {
  // Project state
  currentProject: ProjectInfo | null;

  // Chat state
  messages: Message[];
  input: string;
  isLoading: boolean;

  // Iframe state
  iframeUrl: string;

  // Actions - Project
  setCurrentProject: (project: ProjectInfo | null) => void;

  // Actions - Chat
  setInput: (input: string) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearMessages: () => void;

  // Actions - Iframe
  setIframeUrl: (url: string) => void;
}

export const useProjectStore = create<ProjectGeneratorStore>((set) => ({
  // Initial state - Project
  currentProject: null,

  // Initial state - Chat
  messages: [],
  input: '',
  isLoading: false,

  // Initial state - Iframe
  iframeUrl: '',

  // Actions - Project
  setCurrentProject: (currentProject) => set({ currentProject }),

  // Actions - Chat
  setInput: (input) => set({ input }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  setMessages: (messages) => set({ messages }),
  setIsLoading: (isLoading) => set({ isLoading }),
  clearMessages: () => set({ messages: [] }),

  // Actions - Iframe
  setIframeUrl: (iframeUrl) => set({ iframeUrl }),
}));
