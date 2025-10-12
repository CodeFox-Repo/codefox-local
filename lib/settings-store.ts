import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Tab = 'general' | 'ai' | 'projects' | 'advanced';
type Theme = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';
type AIProvider = 'openai' | 'openrouter';

interface SettingsState {
  // Modal 状态
  isSettingsOpen: boolean;
  currentTab: Tab;

  // UI 设置
  theme: Theme;
  fontSize: FontSize;
  language: string;

  // AI 设置
  aiProvider: AIProvider;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;

  // 项目设置
  defaultProjectPath: string;
  autoSave: boolean;
  autoPreview: boolean;

  // 高级设置
  defaultPort: number;
  autoOpenBrowser: boolean;
}

interface SettingsActions {
  // Modal actions
  setIsSettingsOpen: (open: boolean) => void;
  setCurrentTab: (tab: Tab) => void;

  // UI actions
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  setLanguage: (language: string) => void;

  // AI actions
  setAIProvider: (provider: AIProvider) => void;
  setAPIKey: (key: string) => void;
  setModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  setMaxTokens: (tokens: number) => void;

  // Project actions
  setDefaultProjectPath: (path: string) => void;
  setAutoSave: (enabled: boolean) => void;
  setAutoPreview: (enabled: boolean) => void;

  // Advanced actions
  setDefaultPort: (port: number) => void;
  setAutoOpenBrowser: (enabled: boolean) => void;

  // Utility
  resetToDefaults: () => void;
}

const DEFAULTS: SettingsState = {
  isSettingsOpen: false,
  currentTab: 'general',

  theme: 'system',
  fontSize: 'medium',
  language: 'en',

  aiProvider: 'openrouter',
  apiKey: '',
  model: 'claude-sonnet-4-20250514',
  temperature: 0.7,
  maxTokens: 4096,

  defaultProjectPath: '~/Projects',
  autoSave: true,
  autoPreview: false,

  defaultPort: 3000,
  autoOpenBrowser: true,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      // Modal actions
      setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
      setCurrentTab: (currentTab) => set({ currentTab }),

      // UI actions
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLanguage: (language) => set({ language }),

      // AI actions
      setAIProvider: (aiProvider) => set({ aiProvider }),
      setAPIKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setTemperature: (temperature) => set({ temperature }),
      setMaxTokens: (maxTokens) => set({ maxTokens }),

      // Project actions
      setDefaultProjectPath: (defaultProjectPath) => set({ defaultProjectPath }),
      setAutoSave: (autoSave) => set({ autoSave }),
      setAutoPreview: (autoPreview) => set({ autoPreview }),

      // Advanced actions
      setDefaultPort: (defaultPort) => set({ defaultPort }),
      setAutoOpenBrowser: (autoOpenBrowser) => set({ autoOpenBrowser }),

      // Utility
      resetToDefaults: () => set(DEFAULTS),
    }),
    {
      name: 'codefox-settings',
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        language: state.language,
        aiProvider: state.aiProvider,
        apiKey: state.apiKey,
        model: state.model,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
        defaultProjectPath: state.defaultProjectPath,
        autoSave: state.autoSave,
        autoPreview: state.autoPreview,
        defaultPort: state.defaultPort,
        autoOpenBrowser: state.autoOpenBrowser,
      }),
    }
  )
);
