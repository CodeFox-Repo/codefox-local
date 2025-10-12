import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface ProjectGeneratorStore {
  // Chat state
  messages: Message[];
  input: string;
  isLoading: boolean;

  // Iframe state
  iframeUrl: string;
  generatedCode: string;

  // Actions
  setInput: (input: string) => void;
  setIframeUrl: (url: string) => void;
  setGeneratedCode: (code: string) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearMessages: () => void;
}

export const useProjectStore = create<ProjectGeneratorStore>((set) => ({
  // Initial state
  messages: [],
  input: '',
  isLoading: false,
  iframeUrl: '',
  generatedCode: '',

  // Actions
  setInput: (input) => set({ input }),
  setIframeUrl: (iframeUrl) => set({ iframeUrl }),
  setGeneratedCode: (generatedCode) => set({ generatedCode }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  setMessages: (messages) => set({ messages }),
  setIsLoading: (isLoading) => set({ isLoading }),
  clearMessages: () => set({ messages: [] }),
}));
