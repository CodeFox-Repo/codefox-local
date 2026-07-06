# 代码编辑器集成方案对比（中文详细版）

**创建时间：** 2024-10-19  
**状态：** 方案调研  
**优先级：** 高

---

## 📋 需求概述

为 `RightPanel` 组件的 Code Tab 添加文件树和代码编辑功能，从只读的 HTML 查看器升级为完整的代码编辑环境。

### 核心需求
- **左侧（30%）**：文件树（可展开/收起，点击打开文件）
- **右侧（70%）**：代码编辑器（查看和编辑，保存到项目）
- **目标体验**：类似 VS Code、StackBlitz、CodeSandbox

---

## 🎯 三大技术方案对比

### 方案 1️⃣：Sandpack（CodeSandbox 官方方案）

#### 📦 基本信息

```bash
npm install @codesandbox/sandpack-react
```

**官网：** https://sandpack.codesandbox.io/

#### 🏗️ 架构原理

```
┌─────────────────────────────────────────┐
│  你的 React 组件                        │
│  ┌───────────────────────────────────┐  │
│  │ <Sandpack                         │  │
│  │   files={{ ... }}                │  │
│  │   template="react"                │  │
│  │ />                               │  │
│  └───────────┬───────────────────────┘  │
│              │                          │
│              ↓                          │
│  ┌───────────────────────────────────┐  │
│  │  Sandpack 内部组件                │  │
│  │  ┌─────────┬────────┬──────────┐  │  │
│  │  │ File    │ Editor │ Preview  │  │  │
│  │  │ Tree    │ (CM6)  │ (iframe) │  │  │
│  │  └─────────┴────────┴──────────┘  │  │
│  │                                   │  │
│  │  内置 Bundler (在浏览器运行)      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**核心特点：**
- 🎁 **开箱即用**：文件树 + 编辑器 + 预览全包含
- 🌐 **浏览器编译**：使用自己的 bundler 在浏览器编译代码
- 🎨 **设计精美**：CodeSandbox 团队精心打磨的 UI
- ⚡ **实时预览**：代码变化立即反映到预览窗口

#### 💻 基础用法

```tsx
import { Sandpack } from "@codesandbox/sandpack-react";

export function CodeEditor() {
  return (
    <Sandpack
      files={{
        "/App.js": `export default function App() {
          return <h1>Hello World</h1>
        }`,
        "/styles.css": `body { 
          margin: 0; 
          font-family: sans-serif; 
        }`
      }}
      template="react"
      theme="dark"
      options={{
        showNavigator: true,      // 显示文件导航
        showTabs: true,            // 显示文件标签
        showLineNumbers: true,     // 显示行号
        editorHeight: 600,         // 编辑器高度
        closableTabs: true,        // 可关闭标签
      }}
    />
  );
}
```

#### 🔄 动态更新文件

```tsx
import { 
  SandpackProvider, 
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack 
} from "@codesandbox/sandpack-react";

function CodeEditorWithAI() {
  const [files, setFiles] = useState({
    "/App.js": "// 初始代码"
  });

  // AI 生成代码后更新
  const handleAIGenerate = (newCode: string) => {
    setFiles({
      ...files,
      "/App.js": newCode
    });
  };

  return (
    <SandpackProvider files={files} template="react">
      <SandpackLayout>
        <SandpackCodeEditor />
        <SandpackPreview />
      </SandpackLayout>
    </SandpackProvider>
  );
}
```

#### ✅ 优点

1. **快速集成**
   - 1-2 小时即可完成基础集成
   - 几乎不需要配置
   
2. **功能完整**
   - 文件树自动生成
   - 多文件支持
   - 语法高亮
   - 错误提示
   - 实时预览

3. **生产级质量**
   - CodeSandbox 团队维护
   - 被大量文档网站使用（React、Vue 等）
   - 稳定可靠

4. **可定制**
   - 支持自定义主题
   - 可以隐藏/显示不同面板
   - 支持自定义文件系统

#### ⚠️ 缺点

1. **体积较大**
   - Bundle size: ~4MB
   - 首次加载较慢

2. **内置 Bundler**
   - 有自己的编译逻辑
   - 如果只想编辑文件（不需要预览）可能过于复杂

3. **定制受限**
   - 深度定制比较困难
   - UI 样式调整有限制

4. **文件存储**
   - 文件在 Sandpack 内存中
   - 需要手动同步到后端

#### 🎯 与我们项目的集成

```tsx
// components/preview/code-editor/sandpack-editor.tsx
import { Sandpack } from "@codesandbox/sandpack-react";
import { useEffect, useState } from "react";

interface SandpackEditorProps {
  projectId: string;
}

export function SandpackEditor({ projectId }: SandpackEditorProps) {
  const [files, setFiles] = useState<Record<string, string>>({});

  // 1. 从后端加载文件
  useEffect(() => {
    async function loadProjectFiles() {
      const response = await fetch(
        `/api/project?action=getFileTree&projectId=${projectId}`
      );
      const data = await response.json();
      
      // 加载所有文件内容
      const fileContents: Record<string, string> = {};
      for (const file of data.files) {
        const res = await fetch(
          `/api/project?action=readFile&projectId=${projectId}&filePath=${file.path}`
        );
        const content = await res.json();
        fileContents[file.path] = content.content;
      }
      
      setFiles(fileContents);
    }
    
    loadProjectFiles();
  }, [projectId]);

  // 2. 监听文件变化，保存到后端
  const handleFileChange = async (updatedFiles: Record<string, string>) => {
    // 找出变化的文件
    for (const [path, content] of Object.entries(updatedFiles)) {
      if (files[path] !== content) {
        // 保存到后端
        await fetch('/api/project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'writeFile',
            projectId,
            filePath: path,
            content
          })
        });
      }
    }
    setFiles(updatedFiles);
  };

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
      }}
    />
  );
}
```

#### 💰 成本评估

- **开发成本**：⭐ 非常低（1-2 小时）
- **维护成本**：⭐ 低（基本不需要维护）
- **性能成本**：⭐⭐⭐ 中（4MB bundle）
- **灵活性**：⭐⭐⭐ 中等

---

### 方案 2️⃣：WebContainer API（StackBlitz 方案）

#### 📦 基本信息

```bash
npm install @webcontainer/api
```

**官网：** https://webcontainers.io/

#### 🏗️ 架构原理

```
┌──────────────────────────────────────────────┐
│  Browser Tab                                 │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Main Thread (你的 React 代码)         │  │
│  │                                        │  │
│  │  const container =                    │  │
│  │    await WebContainer.boot()          │  │
│  │                                        │  │
│  │  await container.fs.writeFile(...)    │  │
│  │  await container.spawn('npm', [...])  │  │
│  └───────────────┬────────────────────────┘  │
│                  │ postMessage                │
│                  ↓                            │
│  ┌────────────────────────────────────────┐  │
│  │  Web Worker (隔离线程)                 │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │  🗂️ Virtual File System (内存)    │  │  │
│  │  │  ┌────────────────────────────┐  │  │  │
│  │  │  │ /app/page.tsx             │  │  │  │
│  │  │  │ /package.json             │  │  │  │
│  │  │  │ /node_modules/react/...   │  │  │  │
│  │  │  └────────────────────────────┘  │  │  │
│  │  │                                  │  │  │
│  │  │  🚀 Node.js Runtime (WASM)       │  │  │
│  │  │  - npm install                  │  │  │
│  │  │  - node 命令                    │  │  │
│  │  │  - 模块解析                     │  │  │
│  │  │                                  │  │  │
│  │  │  🌐 HTTP Server                  │  │  │
│  │  │  - Express/Vite dev server      │  │  │
│  │  │  └─> localhost:3000             │  │  │
│  │  └──────────────────────────────────┘  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ⚠️ 全部在内存，刷新页面 = 数据丢失            │
└──────────────────────────────────────────────┘
```

#### 🔑 核心特点

**这是真正的 Node.js 环境！**
- ✅ 可以运行 `npm install`
- ✅ 可以启动 dev server（Vite、Next.js 等）
- ✅ 完整的文件系统 API
- ✅ 可以执行任意 shell 命令
- ⚠️ 但是完全运行在浏览器中！

#### 💻 基础用法

```typescript
import { WebContainer } from '@webcontainer/api';

// 1. 启动 WebContainer（首次需要 5-10 秒）
const container = await WebContainer.boot();

// 2. 创建文件
await container.fs.writeFile('/package.json', JSON.stringify({
  name: 'my-app',
  scripts: {
    dev: 'vite'
  },
  dependencies: {
    'react': '^18.0.0',
    'vite': '^5.0.0'
  }
}));

await container.fs.writeFile('/index.html', `
  <!DOCTYPE html>
  <html>
    <head><title>My App</title></head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
  </html>
`);

// 3. 安装依赖
const installProcess = await container.spawn('npm', ['install']);
await installProcess.exit; // 等待安装完成

// 4. 启动 dev server
const devProcess = await container.spawn('npm', ['run', 'dev']);

// 5. 监听服务器启动
container.on('server-ready', (port, url) => {
  console.log(`Server running at ${url}`);
  // 在 iframe 中显示
  iframe.src = url;
});
```

#### 🔄 完整集成示例

```tsx
// hooks/use-webcontainer.ts
import { WebContainer } from '@webcontainer/api';
import { useEffect, useRef, useState } from 'react';

export function useWebContainer() {
  const containerRef = useRef<WebContainer | null>(null);
  const [status, setStatus] = useState<'idle' | 'booting' | 'ready' | 'error'>('idle');
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  useEffect(() => {
    async function initContainer() {
      try {
        setStatus('booting');
        
        // 启动 WebContainer
        const container = await WebContainer.boot();
        containerRef.current = container;
        
        // 监听服务器
        container.on('server-ready', (port, url) => {
          setServerUrl(url);
        });
        
        setStatus('ready');
      } catch (error) {
        console.error('Failed to boot WebContainer:', error);
        setStatus('error');
      }
    }

    initContainer();

    return () => {
      containerRef.current?.teardown();
    };
  }, []);

  return {
    container: containerRef.current,
    status,
    serverUrl
  };
}

// components/preview/webcontainer-editor.tsx
export function WebContainerEditor({ projectId }: { projectId: string }) {
  const { container, status, serverUrl } = useWebContainer();
  const [files, setFiles] = useState<Record<string, string>>({});

  // AI 生成代码后写入
  const handleAIGenerate = async (filePath: string, content: string) => {
    if (!container) return;
    
    // 1. 写入 WebContainer 文件系统
    await container.fs.writeFile(filePath, content);
    
    // 2. 同步保存到 IndexedDB（持久化）
    await saveToIndexedDB(projectId, filePath, content);
    
    // 3. 防抖后保存到服务器（可选）
    debouncedSaveToBackend(projectId, filePath, content);
  };

  if (status === 'booting') {
    return <div>正在启动 WebContainer...</div>;
  }

  if (status === 'error') {
    return <div>启动失败，请刷新页面重试</div>;
  }

  return (
    <div className="flex h-full">
      {/* 文件树 */}
      <FileTree 
        files={files}
        onFileSelect={(path) => {
          // 从 WebContainer 读取文件
          container?.fs.readFile(path, 'utf-8').then(content => {
            // 显示在编辑器
          });
        }}
      />
      
      {/* 编辑器 */}
      <CodeEditor 
        onChange={(path, content) => {
          handleAIGenerate(path, content);
        }}
      />
      
      {/* 预览 */}
      {serverUrl && (
        <iframe src={serverUrl} />
      )}
    </div>
  );
}
```

#### 📦 文件存储机制详解

**关键问题：文件存在哪里？**

```typescript
await container.fs.writeFile('/app.js', 'code');
```

**答案：浏览器内存中的虚拟文件系统（RAM）**

| 存储位置 | 是否是这里 | 说明 |
|---------|----------|------|
| localStorage | ❌ | 不是（容量太小 5-10MB） |
| IndexedDB | ❌ | 不是（除非手动保存） |
| 浏览器缓存 | ❌ | 不是 |
| 服务器磁盘 | ❌ | 不是 |
| **浏览器内存** | ✅ | **就是这里！** |

**影响：**
```typescript
// ⚠️ 刷新页面 → 所有文件丢失
// ⚠️ 关闭标签页 → 所有文件丢失
// ⚠️ 浏览器崩溃 → 所有文件丢失
```

#### 💾 持久化方案

**方案 A：手动保存到 IndexedDB**

```typescript
import { openDB } from 'idb';

class PersistentWebContainer {
  private container: WebContainer;
  private dbName = 'webcontainer-files';

  async init() {
    // 1. 启动 WebContainer
    this.container = await WebContainer.boot();
    
    // 2. 从 IndexedDB 恢复文件
    await this.restoreFiles();
    
    // 3. 监听文件变化，自动保存
    this.watchFileChanges();
  }

  async saveFile(path: string, content: string) {
    // 写入 WebContainer
    await this.container.fs.writeFile(path, content);
    
    // 同时保存到 IndexedDB
    const db = await openDB(this.dbName, 1, {
      upgrade(db) {
        db.createObjectStore('files', { keyPath: 'path' });
      }
    });
    
    await db.put('files', { path, content, timestamp: Date.now() });
  }

  async restoreFiles() {
    const db = await openDB(this.dbName, 1);
    const files = await db.getAll('files');
    
    for (const file of files) {
      await this.container.fs.writeFile(file.path, file.content);
    }
    
    console.log(`Restored ${files.length} files from IndexedDB`);
  }
}
```

**方案 B：定期快照到服务器**

```typescript
// 每 30 秒自动备份
setInterval(async () => {
  const allFiles = await getAllFilesFromContainer(container);
  
  await fetch('/api/project/snapshot', {
    method: 'POST',
    body: JSON.stringify({
      projectId,
      files: allFiles,
      timestamp: Date.now()
    })
  });
}, 30000);
```

**方案 C：混合方案（推荐）**

```typescript
async function handleFileChange(path: string, content: string) {
  // 1. 立即写入 WebContainer（内存，超快）
  await container.fs.writeFile(path, content);
  
  // 2. 立即写入 IndexedDB（本地持久化，防止刷新丢失）
  await saveToIndexedDB(projectId, path, content);
  
  // 3. 防抖后写入服务器（云端备份，跨设备同步）
  debouncedSaveToServer(projectId, path, content); // 500ms 后执行
}
```

#### ✅ 优点

1. **真实的 Node.js 环境**
   - 可以运行真实的 npm 包
   - 完整的文件系统 API
   - 支持所有 Node.js 命令

2. **无需后端服务器**
   - 完全在浏览器运行
   - 零服务器成本
   - 无需管理文件系统

3. **天然沙箱**
   - 每个用户独立环境
   - 安全隔离
   - 不会互相影响

4. **与现有架构兼容**
   - 你的 AI 聊天逻辑不变
   - 只需把文件操作从 Node.js fs 换成 WebContainer fs
   - 渐进式迁移

#### ⚠️ 缺点

1. **启动慢**
   - 首次启动需要 5-10 秒
   - 需要下载和初始化 WASM

2. **数据易失性**
   - 刷新页面丢失所有数据
   - 必须实现持久化方案

3. **内存限制**
   - 受浏览器内存限制
   - 大型项目可能有问题
   - 建议项目文件 < 100MB

4. **兼容性问题**
   - 需要现代浏览器（Chrome 87+, Firefox 89+）
   - Safari 支持有限
   - 某些 npm 包可能不兼容

5. **调试困难**
   - 错误信息可能不清晰
   - 文件系统操作难以追踪

#### 🎯 适用场景

**最适合：**
- ✅ 云端 SaaS 部署（无需服务器文件系统）
- ✅ 需要运行 dev server 的场景
- ✅ 需要 npm install 的场景
- ✅ 在线编程教育平台

**不适合：**
- ❌ 本地开发（你现在的场景）
- ❌ 需要访问本地文件系统
- ❌ 大型项目（>100MB）

#### 💰 成本评估

- **开发成本**：⭐⭐⭐⭐ 高（需要重构架构）
- **维护成本**：⭐⭐⭐ 中等（需要处理持久化）
- **性能成本**：⭐⭐⭐ 中（启动慢，运行快）
- **灵活性**：⭐⭐⭐⭐⭐ 非常高

---

### 方案 3️⃣：Monaco Editor + react-arborist（自定义组合）

#### 📦 基本信息

```bash
npm install @monaco-editor/react react-arborist
```

**Monaco Editor：** https://microsoft.github.io/monaco-editor/  
**react-arborist：** https://github.com/brimdata/react-arborist

#### 🏗️ 架构原理

```
┌─────────────────────────────────────────┐
│  你的 React 组件                        │
│  ┌───────────────────────────────────┐  │
│  │  ResizablePanelGroup             │  │
│  │  ┌──────────┬──────────────────┐  │  │
│  │  │          │                  │  │  │
│  │  │  File    │   Monaco Editor  │  │  │
│  │  │  Tree    │   (VS Code 编辑器)│  │  │
│  │  │  (react- │                  │  │  │
│  │  │  arborist)│   - 语法高亮     │  │  │
│  │  │          │   - 智能补全     │  │  │
│  │  │  📁 src/ │   - 快捷键       │  │  │
│  │  │   📄 app │   - 查找替换     │  │  │
│  │  │   📄 lib │                  │  │  │
│  │  │          │                  │  │  │
│  │  └──────────┴──────────────────┘  │  │
│  └───────────────────────────────────┘  │
│              ↓ ↑                        │
│     你的 ProjectManager API             │
│     - writeFile()                       │
│     - readFile()                        │
│     - listFiles()                       │
└─────────────────────────────────────────┘
```

#### 💻 文件树组件（react-arborist）

```tsx
import { Tree } from "react-arborist";

interface FileNode {
  id: string;
  name: string;
  children?: FileNode[];
}

export function FileTree({ 
  projectId,
  onFileSelect 
}: { 
  projectId: string;
  onFileSelect: (path: string) => void;
}) {
  const [tree, setTree] = useState<FileNode[]>([]);

  useEffect(() => {
    // 从后端加载文件树
    fetch(`/api/project?action=getFileTree&projectId=${projectId}`)
      .then(res => res.json())
      .then(data => setTree(data.tree));
  }, [projectId]);

  return (
    <Tree
      data={tree}
      openByDefault={false}
      width="100%"
      height="100%"
      indent={24}
      rowHeight={32}
      onSelect={(nodes) => {
        const node = nodes[0];
        if (node && !node.data.children) {
          onFileSelect(node.data.id);
        }
      }}
    >
      {({ node, style, dragHandle }) => (
        <div style={style} ref={dragHandle}>
          <span>{node.data.children ? '📁' : '📄'}</span>
          <span>{node.data.name}</span>
        </div>
      )}
    </Tree>
  );
}
```

#### 💻 Monaco 编辑器组件

```tsx
import Editor from "@monaco-editor/react";

export function CodeEditor({
  projectId,
  filePath,
  initialContent,
  onSave
}: {
  projectId: string;
  filePath: string;
  initialContent: string;
  onSave: (content: string) => void;
}) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // 注册保存快捷键 (Cmd+S / Ctrl+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      const content = editor.getValue();
      onSave(content);
    });
  };

  // 获取文件语言
  const getLanguage = (path: string) => {
    const ext = path.split('.').pop();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'css': 'css',
      'html': 'html',
      'md': 'markdown',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  return (
    <Editor
      height="100%"
      language={getLanguage(filePath)}
      value={initialContent}
      theme="vs-dark"
      onMount={handleEditorDidMount}
      options={{
        fontSize: 14,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        formatOnPaste: true,
        formatOnType: true,
      }}
    />
  );
}
```

#### 🔄 完整集成示例

```tsx
// components/preview/code-editor/custom-editor.tsx
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileTree } from "./file-tree";
import { CodeEditor } from "./code-editor";
import { useState, useEffect } from "react";

export function CustomCodeEditor({ projectId }: { projectId: string }) {
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // 加载文件内容
  const loadFile = async (filePath: string) => {
    const response = await fetch(
      `/api/project?action=readFile&projectId=${projectId}&filePath=${filePath}`
    );
    const data = await response.json();
    
    setCurrentFile(filePath);
    setFileContent(data.content);
    setUnsavedChanges(false);
  };

  // 保存文件
  const saveFile = async (content: string) => {
    if (!currentFile) return;

    await fetch('/api/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'writeFile',
        projectId,
        filePath: currentFile,
        content
      })
    });

    setUnsavedChanges(false);
    toast.success(`${currentFile} 已保存`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">{currentFile || '未选择文件'}</span>
          {unsavedChanges && (
            <span className="text-xs text-orange-500">● 未保存</span>
          )}
        </div>
        <button
          onClick={() => saveFile(fileContent)}
          disabled={!unsavedChanges}
          className="px-3 py-1 text-sm"
        >
          保存 (Cmd+S)
        </button>
      </div>

      {/* 主编辑区域 */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* 左侧文件树 */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <FileTree
            projectId={projectId}
            onFileSelect={loadFile}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* 右侧编辑器 */}
        <ResizablePanel defaultSize={70}>
          {currentFile ? (
            <CodeEditor
              projectId={projectId}
              filePath={currentFile}
              initialContent={fileContent}
              onChange={(content) => {
                setFileContent(content);
                setUnsavedChanges(true);
              }}
              onSave={saveFile}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                从左侧选择一个文件开始编辑
              </p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
```

#### ✅ 优点

1. **完全可控**
   - 每个部分都由你掌控
   - 可以精确定制任何功能
   - 不受第三方组件限制

2. **与现有架构完美集成**
   - 直接使用你的 `ProjectManager` API
   - 文件存储在服务器文件系统
   - 无需修改现有后端逻辑

3. **Monaco = VS Code**
   - 最好的编辑器体验
   - 用户熟悉的快捷键
   - 强大的智能补全

4. **高性能文件树**
   - react-arborist 支持虚拟滚动
   - 可以处理大型项目
   - 流畅的拖拽体验

5. **轻量级**
   - 只加载需要的功能
   - 可以按需懒加载
   - Bundle size 可控

#### ⚠️ 缺点

1. **开发工作量**
   - 需要 4-6 小时完成基础功能
   - 需要自己处理文件树逻辑
   - 需要自己实现保存、快捷键等

2. **需要写胶水代码**
   - 文件树和编辑器之间的协调
   - 状态管理
   - 错误处理

3. **功能需要自己实现**
   - 文件创建/删除/重命名
   - 多标签页
   - 搜索功能

#### 💰 成本评估

- **开发成本**：⭐⭐⭐ 中等（4-6 小时）
- **维护成本**：⭐⭐ 低（代码都在你手里）
- **性能成本**：⭐⭐ 低（~2MB）
- **灵活性**：⭐⭐⭐⭐⭐ 最高

---

## 📊 三大方案终极对比

### 快速决策表

| 对比维度 | Sandpack | WebContainer | Monaco + Arborist |
|---------|----------|--------------|-------------------|
| **开发时间** | ⚡ 1-2 小时 | 🔨 1-2 天 | 🔧 4-6 小时 |
| **Bundle Size** | 📦 ~4MB | 📦 ~5MB | 📦 ~2MB |
| **启动速度** | ⚡ 快（<1s） | 🐢 慢（5-10s） | ⚡ 快（<1s） |
| **文件存储** | 内存 | 内存（需持久化） | 服务器文件系统 |
| **刷新后数据** | ⚠️ 丢失 | ⚠️ 丢失 | ✅ 保留 |
| **定制能力** | ⭐⭐⭐ 中 | ⭐⭐⭐⭐⭐ 极高 | ⭐⭐⭐⭐⭐ 极高 |
| **维护成本** | ⭐ 极低 | ⭐⭐⭐ 中 | ⭐⭐ 低 |
| **与现有 API 集成** | 需要适配 | 需要重构 | ✅ 原生支持 |
| **npm install** | ✅ 内置 | ✅ 支持 | ❌ 不支持 |
| **运行 dev server** | ✅ 内置 | ✅ 支持 | ❌ 不支持 |

### 场景推荐

#### 🎯 场景 1：快速原型/MVP

**推荐：Sandpack**

```
优先级：速度 > 定制化

✅ 1-2 小时快速上线
✅ 不需要深度定制
✅ 适合展示和演示
```

#### 🎯 场景 2：本地开发工具（你当前的项目）

**推荐：Monaco + react-arborist**

```
优先级：可控性 > 速度

✅ 与现有架构无缝集成
✅ 文件存储在本地文件系统
✅ 完全可控和可扩展
✅ 用户体验一流（VS Code 编辑器）
```

#### 🎯 场景 3：云端 SaaS 平台

**推荐：WebContainer**

```
优先级：功能完整性 > 复杂度

✅ 无需服务器文件系统
✅ 每个用户独立沙箱
✅ 可以运行 npm install 和 dev server
✅ 零后端成本
```

---

## 🚀 实施建议

### 阶段 1：本地开发版本（现在）

**选择：Monaco Editor + react-arborist**

**理由：**
- ✅ 保持现有架构（ProjectManager）
- ✅ 文件持久化在本地文件系统
- ✅ 开发成本适中（1 天）
- ✅ 完全可控

**实施步骤：**
```bash
# 1. 安装依赖
bun add @monaco-editor/react react-arborist

# 2. 创建组件（4-6 小时）
components/preview/code-editor/
  ├── custom-editor.tsx     # 主容器
  ├── file-tree.tsx         # 文件树
  ├── code-editor.tsx       # Monaco 编辑器
  └── types.ts              # 类型定义

# 3. 扩展 API（1-2 小时）
app/api/project/route.ts
  - 添加 getFileTree action
  - 添加 readFile action

# 4. 集成到 RightPanel（1 小时）
components/preview/right-panel.tsx
  - 替换 Code TabContent
```

---

### 阶段 2：云端部署版本（未来）

**选择：WebContainer API**

**理由：**
- ✅ 完全前端，无需后端文件系统
- ✅ 可以运行 npm install
- ✅ 可以启动 dev server
- ✅ 零服务器成本

**迁移路径：**

```typescript
// 步骤 1：创建抽象层
interface FileSystemAPI {
  writeFile(path: string, content: string): Promise<void>;
  readFile(path: string): Promise<string>;
  listFiles(): Promise<string[]>;
}

// 步骤 2：本地实现
class LocalFileSystem implements FileSystemAPI {
  async writeFile(path: string, content: string) {
    await fetch('/api/project', {
      method: 'POST',
      body: JSON.stringify({ action: 'writeFile', path, content })
    });
  }
  // ...
}

// 步骤 3：WebContainer 实现
class WebContainerFileSystem implements FileSystemAPI {
  private container: WebContainer;
  
  async writeFile(path: string, content: string) {
    await this.container.fs.writeFile(path, content);
    await this.saveToIndexedDB(path, content); // 持久化
  }
  // ...
}

// 步骤 4：根据环境切换
const fileSystem: FileSystemAPI = 
  isCloudDeployment 
    ? new WebContainerFileSystem()
    : new LocalFileSystem();
```

---

## 💡 最终建议

### 第一阶段（立即开始）

**使用 Sandpack 快速验证**

```bash
# 用 1-2 小时快速实现原型
bun add @codesandbox/sandpack-react

# 验证用户体验和功能完整性
# 如果满意 → 上线使用
# 如果需要更多定制 → 迁移到方案 3
```

### 第二阶段（如果需要更多控制）

**迁移到 Monaco + react-arborist**

```bash
# 投入 1 天时间实现
bun add @monaco-editor/react react-arborist

# 获得完全控制权
# 与现有架构完美集成
```

### 第三阶段（云端部署时）

**评估 WebContainer**

```bash
# 做 POC 验证
bun add @webcontainer/api

# 测试性能和用户体验
# 如果合适 → 重构架构
# 如果不合适 → 保持现有方案，用传统云服务器
```

---

## 📝 决策记录

**2024-10-19**：
- ✅ 决定先尝试 Sandpack 方案
- 📝 理由：最快验证用户体验
- 🔄 如果定制需求多，回退到 Monaco + react-arborist
- 🌐 云端部署时再考虑 WebContainer

---

## 📚 参考资源

### Sandpack
- 官方文档：https://sandpack.codesandbox.io/
- GitHub：https://github.com/codesandbox/sandpack
- 示例：https://sandpack.codesandbox.io/docs/getting-started/custom-ui

### WebContainer
- 官方文档：https://webcontainers.io/
- API 文档：https://webcontainers.io/api
- 教程：https://webcontainers.io/tutorial/1-build-your-first-webcontainer-app

### Monaco Editor
- 官方文档：https://microsoft.github.io/monaco-editor/
- React 封装：https://github.com/suren-atoyan/monaco-react
- Playground：https://microsoft.github.io/monaco-editor/playground.html

### react-arborist
- GitHub：https://github.com/brimdata/react-arborist
- Demo：https://react-arborist.netlify.app/

---

## ❓ FAQ

### Q1: 为什么不用 Ace Editor 或 CodeMirror？

**A:** Monaco 是 VS Code 的编辑器，功能最强大，用户体验最好。虽然体积稍大，但值得。

### Q2: WebContainer 是否免费？

**A:** 是的，完全免费。它是 StackBlitz 开源的技术，不需要账号或付费。

### Q3: Sandpack 可以离线使用吗？

**A:** 可以，但首次需要联网下载依赖。之后可以配置为离线模式。

### Q4: 如何选择文件树组件？

**A:** 
- 简单项目：react-folder-tree
- 大型项目：react-arborist（支持虚拟滚动）
- 需要 Ant Design 风格：rc-tree

### Q5: 能否混合使用这些方案？

**A:** 可以！比如：
- 编辑器用 Monaco
- 预览用 Sandpack 的预览功能
- 文件树用 react-arborist

---

**文档维护者：** AI Assistant  
**最后更新：** 2024-10-19  
**版本：** 1.0

