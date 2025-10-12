# Settings Modal Design Document

## Overview
Add a blurred background settings modal to the CodeFox Local project, using a left sidebar + right content area layout.

## Tech Stack
- **Dialog Component**: Based on Radix UI Dialog
- **State Management**: Zustand 5.0.8
- **Styling**: Tailwind CSS 4 + backdrop-blur effect

---

## UI Layout

### Overall Structure (Sidebar Style)
```
┌──────────────────────────────────────────────────────────┐
│  Settings                                           [X]   │
├────────────────┬─────────────────────────────────────────┤
│                │                                          │
│  General       │  Theme                                   │
│                │  ○ Light  ○ Dark  ● System               │
│  AI Settings   │  ─────────────────────────────────────   │
│                │                                          │
│  Projects      │  Font Size                               │
│                │  ○ Small  ● Medium  ○ Large              │
│  Advanced      │  ─────────────────────────────────────   │
│                │                                          │
│                │  Language                                │
│                │  [English            ▼]                  │
│                │                                          │
├────────────────┴─────────────────────────────────────────┤
│                         [Reset to Defaults]  [Save]      │
└──────────────────────────────────────────────────────────┘
```

### Size Specifications
- **Modal Width**: `max-w-4xl` (~896px)
- **Modal Height**: `h-[600px]`
- **Left Sidebar**: `w-48` (~192px)
- **Right Content**: `flex-1` (responsive)
- **Overlay**: `bg-black/60 backdrop-blur-md`

---

## Settings Content

### General Settings
| Setting | Type | Description |
|---------|------|-------------|
| Theme | Radio Group | Light / Dark / System |
| Font Size | Radio Group | Small / Medium / Large |
| Language | Select | English (default) |

### AI Settings
| Setting | Type | Description |
|---------|------|-------------|
| AI Provider | Select | OpenAI / OpenRouter |
| API Key | Password Input | Local storage |
| Model | Select | gpt-4o, gpt-3.5-turbo, etc. |
| Temperature | Slider | 0-2, step: 0.1 |
| Max Tokens | Number Input | 100-4000 |

### Projects Settings
| Setting | Type | Description |
|---------|------|-------------|
| Default Project Path | Input + Browse | Default path for new projects |
| Auto Save | Switch | Automatic saving |
| Auto Preview | Switch | Auto-open preview after generation |

### Advanced Settings
| Setting | Type | Description |
|---------|------|-------------|
| Default Port | Number Input | 1024-65535 |
| Auto Open Browser | Switch | Open browser on startup |
| Clear Chat History | Button (Danger) | Clear chat history |
| Reset All Settings | Button (Danger) | Restore default settings |

---

## Store Structure

```typescript
interface SettingsState {
  // Modal state
  isSettingsOpen: boolean;
  currentTab: 'general' | 'ai' | 'projects' | 'advanced';

  // UI settings
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  language: string;

  // AI settings
  aiProvider: 'openai' | 'openrouter';
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;

  // Project settings
  defaultProjectPath: string;
  autoSave: boolean;
  autoPreview: boolean;

  // Advanced settings
  defaultPort: number;
  autoOpenBrowser: boolean;

  // Actions
  setIsSettingsOpen: (open: boolean) => void;
  setCurrentTab: (tab: SettingsState['currentTab']) => void;
  resetToDefaults: () => void;
}
```

---

## File Structure

```
components/
└── settings/
    └── SettingsModal.tsx           # Single file implementation

lib/
└── settings-store.ts               # Zustand Store

docs/
└── 2025-10-11/
    └── settings_design_docs.md     # This document
```

---

## Interaction Behavior

### Opening Methods
1. Settings button in top toolbar
2. Keyboard shortcut: `Cmd/Ctrl + ,` (optional)

### Save Logic
- **Real-time save**: Theme (immediate switching)
- **Confirm save**: Other settings require Save button click
- **Persistence**: LocalStorage

### Validation Rules
- API Key: Non-empty
- Port: 1024-65535
- Temperature: 0-2
- Max Tokens: 100-4000

### Dangerous Operations
- Clear Chat History: Requires confirmation
- Reset All Settings: Requires confirmation

---

## Settings Item Row Layout

Each settings item uses a left-right layout:

```tsx
<div className="flex items-center justify-between py-4 border-b">
  <div className="flex-1">
    <Label>Setting Name</Label>
    <p className="text-sm text-muted-foreground">Description</p>
  </div>
  <div className="w-64">
    {/* Control: Input/Switch/Select/Slider */}
  </div>
</div>
```

---

## Accessibility

- ✅ Keyboard navigation (Tab, Enter, Esc)
- ✅ ARIA labels
- ✅ Focus trap
- ✅ Esc to close

---

## Default Values

```typescript
const DEFAULTS = {
  theme: 'system',
  fontSize: 'medium',
  language: 'en',
  aiProvider: 'openai',
  apiKey: '',
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2000,
  defaultProjectPath: '~/Projects',
  autoSave: true,
  autoPreview: false,
  defaultPort: 3000,
  autoOpenBrowser: true,
};
```
