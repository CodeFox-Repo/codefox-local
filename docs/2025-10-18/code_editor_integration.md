# Code Editor Integration - File Tree & Editor Feature

**Created:** 2024-10-19  
**Status:** Planning  
**Priority:** High

## 📋 Overview

Add file tree structure display and code editing capabilities to the `RightPanel` component's Code Tab, transforming it from a read-only HTML viewer into a fully functional code editor.

---

## 🎯 Requirements

### Current State
- Code Tab only displays `generatedCode` (single HTML string)
- Uses `react-syntax-highlighter` for read-only display
- No file management or editing capability
- No project structure visibility

### Target State
- **Left Panel (30%)**: Interactive file tree
  - Display project directory structure
  - Expand/collapse folders
  - File icons based on extensions
  - Click to select and open files
  
- **Right Panel (70%)**: Code editor
  - View and edit file contents
  - Syntax highlighting for multiple languages
  - Save changes back to project
  - Support for multiple file tabs (optional)

### Expected User Experience
Similar to VS Code, StackBlitz, or CodeSandbox embedded IDEs.

---

## 🏗️ Technical Solutions Comparison

### Option 1: Sandpack (Recommended - First Attempt) ⭐

**Package:** `@codesandbox/sandpack-react`

**Pros:**
- ✅ **All-in-one solution** - File tree + Editor + Preview bundled
- ✅ **Production-ready** - Built and maintained by CodeSandbox team
- ✅ **Beautiful UI** - Polished design out of the box
- ✅ **Fast integration** - Can be implemented in 1-2 hours
- ✅ **Built-in bundler** - Can run code in browser sandbox
- ✅ **Customizable** - Can hide/show different panels

**Cons:**
- ⚠️ May need style adjustments to match our theme
- ⚠️ Has its own bundler (might be overkill if we just want file editing)
- ⚠️ ~4MB bundle size

**Installation:**
```bash
bun add @codesandbox/sandpack-react
```

**Basic Usage:**
```tsx
import { Sandpack } from "@codesandbox/sandpack-react";

<Sandpack
  files={{
    "/App.js": "export default function App() { return <div>Hello</div> }",
    "/styles.css": "body { margin: 0; }"
  }}
  template="react"
  theme="dark"
  options={{
    showNavigator: true,
    showTabs: true,
    showLineNumbers: true,
    editorHeight: 600
  }}
/>
```

---

### Option 2: Monaco Editor + react-arborist (Fallback)

**Packages:**
- `@monaco-editor/react` - VS Code's editor
- `react-arborist` - Modern file tree component

**Pros:**
- ✅ **Full control** - Complete customization of every aspect
- ✅ **Monaco = VS Code** - Best-in-class editor experience
- ✅ **Native API integration** - Works directly with our `ProjectManager`
- ✅ **Lightweight file tree** - Modern, performant component

**Cons:**
- ⚠️ More integration work (~4-6 hours)
- ⚠️ Need to write glue code between components
- ⚠️ ~3.5MB bundle size

**Installation:**
```bash
bun add @monaco-editor/react react-arborist
```

---

### Option 3: WebContainer API (Future - Cloud Deployment)

**Package:** `@webcontainer/api`

**Use Case:** When we want to run a complete Node.js environment in the browser

**Pros:**
- ✅ **Real Node.js in browser** - Can run `npm install`, dev servers
- ✅ **No backend required** - Everything runs client-side
- ✅ **Free** - No cloud costs
- ✅ **Sandboxed** - Each user has isolated environment

**Cons:**
- ⚠️ Slower initial boot (~10s)
- ⚠️ More complex to integrate
- ⚠️ Requires significant architecture changes

**Note:** This is for future consideration when deploying to cloud. See "Future Architecture" section below.

---

## 🚀 Implementation Plan (Phase 1: Sandpack)

### Step 1: Setup & Installation

```bash
bun add @codesandbox/sandpack-react
```

### Step 2: Create Sandpack Integration Component

**File:** `components/preview/code-editor/sandpack-editor.tsx`

```tsx
import { Sandpack, SandpackProvider, SandpackLayout } from "@codesandbox/sandpack-react";
import { useProjectStore } from "@/lib/store";
import { useEffect, useState } from "react";

interface SandpackEditorProps {
  projectId: string;
}

export function SandpackEditor({ projectId }: SandpackEditorProps) {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Load project files from backend
  useEffect(() => {
    async function loadFiles() {
      setLoading(true);
      try {
        // Fetch file tree
        const response = await fetch(
          `/api/project?action=getFileTree&projectId=${projectId}`
        );
        const data = await response.json();
        
        // Load file contents
        const fileContents: Record<string, string> = {};
        for (const file of data.files) {
          const res = await fetch(
            `/api/project?action=readFile&projectId=${projectId}&filePath=${file.path}`
          );
          const content = await res.json();
          fileContents[file.path] = content.content;
        }
        
        setFiles(fileContents);
      } catch (error) {
        console.error("Failed to load files:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadFiles();
  }, [projectId]);

  if (loading) {
    return <div>Loading project files...</div>;
  }

  return (
    <Sandpack
      files={files}
      template="react-ts"
      theme="dark"
      options={{
        showNavigator: true,
        showTabs: true,
        showLineNumbers: true,
        editorHeight: "100%",
        closableTabs: true
      }}
    />
  );
}
```

### Step 3: Update API Routes

**File:** `app/api/project/route.ts`

Add new actions:

```typescript
// Get file tree structure
case 'getFileTree': {
  const { projectId } = await req.json();
  const files = await projectManager.listFiles(projectId);
  
  // Convert flat list to tree structure
  const tree = buildFileTree(files);
  
  return NextResponse.json({ tree });
}

// Read single file
case 'readFile': {
  const { projectId, filePath } = await req.json();
  const content = await projectManager.readFile(projectId, filePath);
  
  return NextResponse.json({ content });
}

// writeFile already exists - can be reused for saving
```

### Step 4: Update RightPanel Component

**File:** `components/preview/right-panel.tsx`

Replace Code TabContent:

```tsx
<TabsContent value="code" className="flex-1 m-0 overflow-hidden">
  {currentProject ? (
    <SandpackEditor projectId={currentProject.id} />
  ) : (
    <div className="flex items-center justify-center h-full">
      <p>No project loaded</p>
    </div>
  )}
</TabsContent>
```

### Step 5: Handle File Changes

Implement auto-save or manual save when user edits files in Sandpack:

```tsx
// Listen to file changes in Sandpack
<Sandpack
  // ... other props
  onFileChange={(files) => {
    // Debounced save to backend
    debouncedSaveFiles(projectId, files);
  }}
/>
```

---

## 📊 Implementation Checklist

### Phase 1: Basic Integration
- [ ] Install Sandpack package
- [ ] Create `SandpackEditor` component
- [ ] Add `getFileTree` API endpoint
- [ ] Add `readFile` API endpoint
- [ ] Update `RightPanel` to use Sandpack
- [ ] Test with existing projects

### Phase 2: Polish & Features
- [ ] Implement file save functionality
- [ ] Add loading states
- [ ] Handle errors gracefully
- [ ] Match Sandpack theme to app theme
- [ ] Add keyboard shortcuts (Cmd+S to save)
- [ ] Show unsaved changes indicator

### Phase 3: Optimization
- [ ] Lazy load Sandpack (code splitting)
- [ ] Cache file contents
- [ ] Optimize file tree API (pagination)
- [ ] Add file search functionality

---

## 🎨 UI/UX Considerations

### Layout
- Use existing `Tabs` component structure
- Sandpack fills entire Code tab content area
- Responsive design - collapse file tree on small screens

### Theme Integration
- Configure Sandpack to use our dark/light theme
- Match colors to existing UI components
- Consistent font family (use our mono font)

### Performance
- Lazy load Sandpack component (only when Code tab is active)
- Implement virtual scrolling for large file trees
- Debounce file save operations

---

## 🔮 Future Enhancements (Phase 2+)

### Short-term
- [ ] Multiple file tabs support
- [ ] File search (Cmd+P)
- [ ] Git integration indicator
- [ ] File/folder create/delete/rename
- [ ] Syntax error highlighting
- [ ] Code formatting (Prettier integration)

### Long-term (Cloud Deployment)
- [ ] Migrate to WebContainer API for true Node.js support
- [ ] Real-time collaboration (multiplayer editing)
- [ ] Terminal integration
- [ ] NPM package installation UI
- [ ] Deploy button (Vercel/Netlify integration)

---

## 🌐 Future Architecture: Cloud Deployment

When moving to cloud/remote deployment, consider WebContainer:

```
┌─────────────────────────────────────────┐
│  Frontend (Vercel/Netlify)              │
│  ┌─────────────┬──────────────────────┐ │
│  │  Chat       │  WebContainer        │ │
│  │             │  (Browser Sandbox)   │ │
│  │  AI ────────┼─→ fs.writeFile()     │ │
│  │  generates  │     npm install      │ │
│  │  code       │     npm run dev      │ │
│  └─────────────┴──────────────────────┘ │
└─────────────────────────────────────────┘
         No backend server needed!
```

**Benefits:**
- Zero backend infrastructure costs
- Each user has isolated environment
- Real Node.js (npm, dev servers work)
- No server-side file system management

**Migration Path:**
1. Replace `ProjectManager` calls with WebContainer API
2. Keep same chat interface
3. Files live in browser memory instead of server filesystem

---

## ⚠️ Known Limitations & Considerations

### Sandpack Limitations
1. **Bundle size**: ~4MB - may impact initial load time
2. **Customization**: Limited compared to building custom solution
3. **File operations**: May need to sync with backend filesystem

### Technical Debt
- Current `generatedCode` prop in RightPanel will be deprecated
- Need to handle backwards compatibility during migration
- Consider how this affects existing projects in localStorage

### Security
- Sandpack runs code in sandboxed iframe (secure)
- Still need to validate file paths on backend
- Prevent directory traversal attacks

---

## 📚 Resources

- [Sandpack Documentation](https://sandpack.codesandbox.io/)
- [Monaco Editor React](https://github.com/suren-atoyan/monaco-react)
- [react-arborist](https://github.com/brimdata/react-arborist)
- [WebContainer API](https://webcontainers.io/)

---

## 🤝 Decision Log

**2024-10-19**: Decided to try Sandpack first
- Rationale: Fastest time to MVP, production-ready solution
- Fallback: Monaco + react-arborist if customization needed
- Future: Consider WebContainer for cloud deployment

---

## 📝 Notes

- This feature transforms CodeFox from a "HTML generator" to a "full-stack IDE"
- Aligns with our vision of AI-powered local development
- Key differentiator from competitors who only generate static code
- Opens door for future features: terminal, git integration, deploy

