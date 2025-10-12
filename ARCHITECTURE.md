# CodeFox Local - 架构文档

## 概述

CodeFox Local 是一个基于 AI 的本地网站项目生成器。用户通过自然语言描述需求，AI 助手会实时克隆模板仓库、修改文件、执行命令，并在右侧预览生成的项目。

**核心特点**:
- ✅ 客户端工具调用（不是服务端）
- ✅ 仅支持 `writeFile` 和 `executeCommand` 两个工具
- ✅ 实时项目预览（iframe）
- ✅ 基于 hetagon-template 模板

---

## 工作流程

```
用户输入 → AI 分析 → 生成 <tool_call> → 客户端解析 → 执行工具 → 实时预览
```

### 详细步骤

1. **项目初始化**
   - 页面加载时自动克隆 `https://github.com/Sma1lboy/hetagon-template.git`
   - 创建到 `.projects/project-{timestamp}/`
   - 移除 `.git` 目录使其成为全新项目

2. **用户输入**
   ```
   用户: "创建一个登录页面"
   ```

3. **AI 响应**
   ```xml
   我来帮你创建登录页面。

   <tool_call>
   {"name": "writeFile", "parameters": {"filePath": "app/login/page.tsx", "content": "..."}}
   </tool_call>

   <tool_call>
   {"name": "executeCommand", "parameters": {"command": "bun install lucide-react"}}
   </tool_call>
   ```

4. **客户端执行**
   - `extractToolCalls()` 解析 `<tool_call>` 标记
   - 调用 `/api/project` 执行每个工具
   - 显示 toast 通知执行状态

5. **实时预览**
   - 右侧 iframe 加载项目开发服务器（`http://localhost:3001`）
   - 可切换 Preview/Code 视图

---

## 技术栈

| 分类 | 技术 |
|------|------|
| **前端框架** | Next.js 15.5.4 (App Router + Turbopack) |
| **UI 库** | React 19.1.0 |
| **状态管理** | Zustand 5.0.8 |
| **AI SDK** | @ai-sdk/react 2.0.68 |
| **UI 组件** | Radix UI + Tailwind CSS 4 |
| **通知** | Sonner |
| **AI 模型** | Claude Sonnet 4.5 (via OpenRouter) |
| **包管理器** | Bun |

---

## 项目结构

```
codefox-local/
├── app/
│   ├── api/
│   │   ├── chat/route.ts         # AI 聊天 API
│   │   └── project/route.ts      # 项目操作 API
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 主页面
├── components/
│   ├── chat/                     # 聊天组件
│   ├── iframe/                   # 预览组件
│   ├── layout/                   # 布局组件
│   └── ui/                       # UI 组件库
├── lib/
│   ├── client-tools.ts           # ⭐ 客户端工具处理
│   ├── project-manager.ts        # ⭐ 项目管理器
│   ├── store.ts                  # 全局状态
│   └── utils.ts
├── .projects/                    # 生成的项目 (gitignored)
└── .env.local                    # 环境变量
```

---

## 核心模块

### 1. 项目管理器 (`lib/project-manager.ts`)

**职责**: 管理项目生命周期和文件操作

```typescript
class ProjectManager {
  // 创建项目
  async createProject(name: string): Promise<ProjectInfo>

  // 文件操作
  async writeFile(projectId, filePath, content): Promise<void>
  async readFile(projectId, filePath): Promise<string>
  async listFiles(projectId): Promise<string[]>

  // 命令执行
  async executeCommand(projectId, command): Promise<{stdout, stderr}>

  // 清理
  async deleteProject(projectId): Promise<void>
}
```

**关键实现**:
- 单例模式
- 克隆模板仓库: `git clone <repo> <path>`
- 移除 `.git`: `rm -rf <path>/.git`
- 30秒命令超时保护

---

### 2. 客户端工具处理器 (`lib/client-tools.ts`)

**职责**: 解析和执行 AI 生成的工具调用

```typescript
// 提取工具调用
function extractToolCalls(content: string): ToolCall[]

// 执行工具
async function executeToolCall(
  projectId: string,
  toolCall: ToolCall
): Promise<ToolResult>

// 创建项目
async function createProject(name: string)
```

**工具调用格式**:
```xml
<tool_call>
{"name": "writeFile", "parameters": {"filePath": "...", "content": "..."}}
</tool_call>
```

---

### 3. API 路由

#### Chat API (`/api/chat`)

**功能**: 处理 AI 对话

**System Prompt 要点**:
```
你是一个全栈开发专家。

可用工具：
1. writeFile - 写入文件
   参数: { filePath: string, content: string }

2. executeCommand - 执行命令
   参数: { command: string }

格式要求：
<tool_call>
{"name": "...", "parameters": {...}}
</tool_call>
```

**请求**:
```json
{
  "messages": [{"role": "user", "parts": [{"type": "text", "text": "..."}]}]
}
```

**响应**: 流式 (Server-Sent Events)

---

#### Project API (`/api/project`)

**功能**: 执行项目操作

**支持的操作**:

| Action | 参数 | 说明 |
|--------|------|------|
| `create` | `name` | 创建项目 |
| `writeFile` | `projectId`, `filePath`, `content` | 写入文件 |
| `executeCommand` | `projectId`, `command` | 执行命令 |
| `listFiles` | `projectId` | 列出文件 |
| `delete` | `projectId` | 删除项目 |

**示例**:
```json
{
  "action": "writeFile",
  "projectId": "project-123",
  "filePath": "app/page.tsx",
  "content": "..."
}
```

---

### 4. 状态管理 (`lib/store.ts`)

```typescript
interface ProjectGeneratorStore {
  // 项目
  currentProject: ProjectInfo | null
  projectFiles: string[]

  // 聊天
  messages: Message[]
  input: string
  isLoading: boolean

  // 预览
  iframeUrl: string
}
```

---

## 用户界面

### 布局 (30% / 70%)

```
┌──────────────────────────────────────┐
│  CodeFox Local                       │
├───────────┬──────────────────────────┤
│  Chat     │  Preview                 │
│  (30%)    │  (70%)                   │
│           │                          │
│  Messages │  ┌─────────────────────┐ │
│  ───────  │  │ [Preview] [Code]    │ │
│  Input    │  │                     │ │
│           │  │  Iframe or Code     │ │
└───────────┴──────────────────────────┘
```

### 主要组件

1. **ChatContainer** - 聊天界面
   - MessageList (Markdown + 代码高亮)
   - ChatInput (自动调整高度)

2. **IframeContainer** - 预览界面
   - Preview Tab: 安全 iframe
   - Code Tab: 语法高亮代码查看

3. **MainLayout** - 可调整大小布局
   - 默认 30% / 70%
   - 可拖动 (20%-50% / 50%-80%)

---

## 环境配置

### 必需变量 (`.env.local`)

```bash
# OpenRouter API Key (必需)
OPENROUTER_API_KEY=sk-or-v1-...

# AI 模型 (可选，默认 claude-sonnet-4.5)
NEXT_PUBLIC_DEFAULT_MODEL=anthropic/claude-sonnet-4.5
```

### 获取 API Key

1. 访问 [OpenRouter.ai](https://openrouter.ai/)
2. 注册并生成 API Key
3. 添加到 `.env.local`

---

## 开发指南

### 启动

```bash
# 安装依赖
bun install

# 启动主应用 (端口 3000)
bun run dev
```

### 生成的项目

```bash
# 进入项目目录
cd .projects/project-{timestamp}

# 安装依赖
bun install

# 启动 (端口 3001)
bun run dev -- --port 3001
```

---

## 工作流示例

### 场景: 创建登录页面

#### 1. 用户输入
```
"创建一个登录页面，包含邮箱和密码输入框"
```

#### 2. AI 响应
```markdown
我来创建登录页面。

<tool_call>
{"name": "writeFile", "parameters": {
  "filePath": "app/login/page.tsx",
  "content": "export default function LoginPage() {...}"
}}
</tool_call>

<tool_call>
{"name": "executeCommand", "parameters": {
  "command": "bun install lucide-react"
}}
</tool_call>

登录页面已创建，包含:
- 邮箱输入框
- 密码输入框
- 记住我选项
- Tailwind CSS 样式
```

#### 3. 客户端执行
```typescript
// 1. 解析
const toolCalls = extractToolCalls(response)
// [{name: "writeFile", ...}, {name: "executeCommand", ...}]

// 2. 执行
for (const call of toolCalls) {
  await executeToolCall(projectId, call)
  toast.success(`${call.name} completed`)
}
```

#### 4. 结果
```bash
.projects/project-123/
└── app/
    └── login/
        └── page.tsx  # ✅ 已创建
```

#### 5. 预览
- Iframe 加载 `http://localhost:3001/login`
- 用户看到新页面

---

## 安全考虑

### 当前实现

⚠️ **警告**: 当前实现适合本地开发，生产环境需加强安全

| 风险 | 当前状态 | 建议改进 |
|------|----------|----------|
| 命令注入 | ⚠️ 允许任意命令 | 添加命令白名单 |
| 路径遍历 | ⚠️ 未验证 `../` | 验证和规范化路径 |
| Iframe XSS | ✅ 使用 sandbox | 保持现状 |
| 超时保护 | ✅ 30秒限制 | 保持现状 |

### 建议改进

```typescript
// 命令白名单
const ALLOWED_COMMANDS = [
  /^bun install/,
  /^bun run (dev|build|start)/,
  /^git /,
]

// 路径验证
function validatePath(path: string) {
  if (path.includes('..') || path.startsWith('/')) {
    throw new Error('Invalid path')
  }
}
```

---

## 已知限制

1. ❌ 单项目模式（刷新会创建新项目）
2. ❌ 端口固定为 3001
3. ❌ 无文件树视图
4. ❌ 无代码编辑器
5. ❌ 无项目持久化

---

## 未来改进

### Phase 1: 基础功能
- [ ] 文件树组件
- [ ] Monaco 代码编辑器
- [ ] 项目列表和切换
- [ ] 项目持久化（数据库）

### Phase 2: 开发体验
- [ ] 终端输出显示
- [ ] 错误日志
- [ ] Git 集成
- [ ] 依赖安装进度条

### Phase 3: 高级功能
- [ ] 多页面项目
- [ ] 部署集成（Vercel/Netlify）
- [ ] 模板市场
- [ ] 协作编辑

---

## 故障排查

### 问题: 项目初始化失败

**症状**: Toast 显示 "Failed to initialize project"

**原因**: Git 克隆失败

**解决**:
```bash
# 测试克隆
git clone https://github.com/Sma1lboy/hetagon-template.git test-clone

# 检查网络
curl -I https://github.com
```

---

### 问题: 工具调用不执行

**症状**: AI 响应但无文件创建

**调试**:
```typescript
// 在 app/page.tsx 添加
console.log('Tool calls:', extractToolCalls(content))
```

**检查**:
1. `<tool_call>` 格式正确？
2. JSON 格式有效？
3. 浏览器控制台有错误？

---

### 问题: Iframe 空白

**原因**: 项目开发服务器未启动

**解决**:
```bash
cd .projects/project-{id}
bun install
bun run dev -- --port 3001
```

---

## API 参考

### POST /api/chat

**请求**:
```json
{
  "messages": [
    {"role": "user", "parts": [{"type": "text", "text": "..."}]}
  ]
}
```

**响应**: SSE 流

---

### POST /api/project

**创建项目**:
```json
{"action": "create", "name": "my-app"}
```

**写文件**:
```json
{
  "action": "writeFile",
  "projectId": "project-123",
  "filePath": "app/page.tsx",
  "content": "..."
}
```

**执行命令**:
```json
{
  "action": "executeCommand",
  "projectId": "project-123",
  "command": "bun install react"
}
```

---

## 更新日志

### v1.0.0 (2025-10-11)

**新功能**:
- ✅ 自动克隆 hetagon-template
- ✅ 客户端工具调用 (writeFile, executeCommand)
- ✅ 实时 iframe 预览
- ✅ Markdown 渲染和代码高亮
- ✅ Toast 通知
- ✅ 可调整布局 (30%/70%)

**技术栈**:
- Next.js 15.5.4
- React 19.1.0
- Zustand 5.0.8
- AI SDK v5
- Bun

---

## 贡献

欢迎提交 Issue 和 Pull Request！

**联系方式**:
- GitHub: [Sma1lboy/codefox-local](https://github.com/Sma1lboy/codefox-local)

---

**最后更新**: 2025-10-11
