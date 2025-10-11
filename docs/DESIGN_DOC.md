# Chat + iframe 项目设计文档

## 1. 项目概述

一个本地Web应用，左侧为AI聊天界面，右侧为iframe内容展示区域。用户可以通过聊天与AI交互，AI可以控制右侧iframe显示不同的网页内容。

## 2. 技术栈

### 2.1 核心框架
- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **运行时**: Node.js 18+

### 2.2 前端技术
- **UI框架**: React 18
- **UI组件库**: Shadcn/ui
- **样式方案**: Tailwind CSS
- **图标**: Lucide React
- **状态管理**: React Hooks + Context (或 Zustand)
- **表单处理**: React Hook Form

### 2.3 后端技术
- **API路由**: Next.js API Routes (App Router)
- **AI SDK**: Vercel AI SDK v5
- **AI提供商**: OpenRouter API
- **默认模型**: Claude Sonnet 4.5
- **实时通信**: Server-Sent Events (通过 AI SDK 流式响应)

### 2.4 开发工具
- **包管理器**: pnpm (推荐) / npm / yarn
- **代码规范**: ESLint + Prettier
- **Git Hooks**: Husky (可选)

---

## 3. 项目结构

```
codefox-local/
├── app/
│   ├── layout.tsx                 # 根布局
│   ├── page.tsx                   # 首页 (主聊天界面)
│   ├── api/
│   │   └── chat/
│   │       └── route.ts           # 聊天API端点 (SSE流式响应)
│   └── globals.css                # 全局样式
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx      # 聊天容器 (左侧)
│   │   ├── ChatMessage.tsx        # 单条消息组件
│   │   ├── ChatInput.tsx          # 输入框组件
│   │   └── MessageList.tsx        # 消息列表
│   ├── iframe/
│   │   ├── IframeContainer.tsx    # iframe容器 (右侧)
│   │   └── IframeControls.tsx     # iframe控制栏
│   ├── layout/
│   │   ├── MainLayout.tsx         # 主布局组件
│   │   └── ResizablePanel.tsx     # 可调整大小的面板
│   └── ui/                        # Shadcn/ui 组件
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── scroll-area.tsx
│       └── ...
├── lib/
│   ├── openrouter.ts              # OpenRouter API 配置
│   ├── ai-config.ts               # AI SDK 配置
│   └── utils.ts                   # 工具函数
├── hooks/
│   ├── useChat.ts                 # 聊天Hook (基于AI SDK)
│   └── useIframe.ts               # iframe控制Hook
├── types/
│   ├── chat.ts                    # 聊天相关类型
│   └── iframe.ts                  # iframe相关类型
├── public/
│   └── ...                        # 静态资源
├── .env.local                     # 环境变量
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. 前端设计

### 4.1 页面布局设计

#### 4.1.1 整体布局 (Desktop)

```
┌──────────────────────────────────────────────────────────────────┐
│  Header Bar                                                       │
│  [Logo] Chat + iframe Viewer                    [Settings] [?]   │
├─────────────────────────────┬────────────────────────────────────┤
│                             │                                    │
│   Chat Panel (40%)          │   iframe Panel (60%)              │
│   ┌─────────────────────┐   │   ┌────────────────────────────┐  │
│   │ Message List        │   │   │ URL: [____________] [Go]   │  │
│   │ ┌─────────────────┐ │   │   ├────────────────────────────┤  │
│   │ │ User: Hi        │ │   │   │                            │  │
│   │ └─────────────────┘ │   │   │                            │  │
│   │ ┌─────────────────┐ │   │   │     iframe Content         │  │
│   │ │ AI: Hello!      │ │   │   │                            │  │
│   │ │ [Open Example]  │ │   │   │                            │  │
│   │ └─────────────────┘ │   │   │                            │  │
│   │                     │   │   │                            │  │
│   │ ...                 │   │   │                            │  │
│   └─────────────────────┘   │   │                            │  │
│   ┌─────────────────────┐   │   └────────────────────────────┘  │
│   │ [Input...]  [Send]  │   │                                    │
│   └─────────────────────┘   │                                    │
│                             │                                    │
└─────────────────────────────┴────────────────────────────────────┘
             ↕ Resizable
```

#### 4.1.2 响应式布局 (Mobile/Tablet)

**Tablet (< 1024px)**: 左侧30%，右侧70%

**Mobile (< 768px)**:
- Tab切换模式：[Chat] [Preview] 两个Tab
- 或垂直堆叠：上半部分Chat，下半部分iframe

### 4.2 组件设计

#### 4.2.1 MainLayout.tsx
```typescript
// 主布局：包含可调整大小的分栏
- 使用 react-resizable-panels 或自定义实现
- 左侧面板：最小宽度 300px，默认 40%
- 右侧面板：最小宽度 400px，默认 60%
- 分隔条：可拖拽调整
```

#### 4.2.2 ChatContainer.tsx
```typescript
// 聊天容器
- 顶部：标题栏 "AI Assistant"
- 中间：MessageList (可滚动)
- 底部：ChatInput
- 状态：loading, messages, error
```

#### 4.2.3 ChatMessage.tsx
```typescript
// 消息组件
- 用户消息：右对齐，蓝色背景
- AI消息：左对齐，灰色背景
- 支持Markdown渲染
- 支持代码高亮
- 支持特殊按钮（如"打开链接"）
```

#### 4.2.4 ChatInput.tsx
```typescript
// 输入框
- Textarea自动高度调整
- 发送按钮 (Ctrl+Enter/Cmd+Enter)
- Loading状态禁用
- 字符计数（可选）
```

#### 4.2.5 IframeContainer.tsx
```typescript
// iframe容器
- 顶部：URL控制栏
  - 输入框显示当前URL
  - 刷新按钮
  - 后退/前进按钮（可选）
- iframe：100%宽高，安全沙箱设置
- 错误处理：URL无法加载时显示提示
```

### 4.3 UI/UX 设计要点

#### 4.3.1 颜色方案 (使用Tailwind CSS)
```css
/* 主色调 */
Primary: blue-600 (#2563eb)
Secondary: gray-600 (#4b5563)

/* 背景 */
Background: white / gray-50
Chat User Bg: blue-100
Chat AI Bg: gray-100

/* 边框 */
Border: gray-200

/* 文本 */
Text Primary: gray-900
Text Secondary: gray-600
```

#### 4.3.2 交互设计
1. **消息发送**
   - 点击发送按钮或 Ctrl+Enter
   - 发送后清空输入框
   - 显示loading状态

2. **流式响应**
   - AI回复实时流式显示
   - 打字机效果
   - 滚动自动跟随最新消息

3. **iframe控制**
   - AI可以在消息中嵌入"打开链接"按钮
   - 点击按钮自动在右侧iframe加载URL
   - 支持手动输入URL

4. **错误处理**
   - API错误显示Toast提示
   - iframe加载失败显示占位符
   - 网络错误重试机制

---

## 5. 后端设计

### 5.1 API Routes

#### 5.1.1 POST /api/chat
**功能**: 处理聊天请求，返回SSE流式响应

**请求体**:
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant' | 'system',
    content: string
  }>,
  model?: string // 可选，默认 anthropic/claude-sonnet-4.5
}
```

**响应**: Server-Sent Events (流式)
```typescript
// 使用 AI SDK 的 streamText
data: {"type":"text","content":"Hello"}
data: {"type":"text","content":" world"}
data: {"type":"done"}
```

**实现要点**:
```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  const result = await streamText({
    model: openrouter('anthropic/claude-sonnet-4.5'),
    messages,
    system: 'You are a helpful assistant...',
  });

  return result.toDataStreamResponse();
}
```

### 5.2 环境变量

```bash
# .env.local
OPENROUTER_API_KEY=your_openrouter_api_key_here

# 可选配置
NEXT_PUBLIC_DEFAULT_MODEL=anthropic/claude-sonnet-4.5
NEXT_PUBLIC_APP_NAME=Chat + iframe Viewer
```

---

## 6. AI集成设计

### 6.1 AI SDK v5 使用

```typescript
// hooks/useChat.ts
import { useChat as useAIChat } from 'ai/react';

export function useChat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useAIChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  };
}
```

### 6.2 System Prompt 设计

```typescript
const SYSTEM_PROMPT = `你是一个智能助手，可以帮助用户浏览和查看网页内容。

特殊能力：
1. 当用户询问某个网站或想查看某个URL时，你可以在回复中使用特殊标记：
   [OPEN_URL:https://example.com]

2. 这个标记会被前端解析，自动在右侧iframe中打开对应网页。

3. 例如：
   - 用户："打开百度"
   - 你回复："好的，我为你打开百度。[OPEN_URL:https://www.baidu.com]"

请自然地与用户对话，并在合适的时候提供网页链接。`;
```

### 6.3 URL解析和控制

```typescript
// lib/parse-url.ts
export function parseURLFromMessage(content: string): string | null {
  const match = content.match(/\[OPEN_URL:(https?:\/\/[^\]]+)\]/);
  return match ? match[1] : null;
}

// 在 ChatMessage 组件中使用
useEffect(() => {
  const url = parseURLFromMessage(message.content);
  if (url && message.role === 'assistant') {
    // 通知 iframe 容器打开 URL
    onOpenUrl?.(url);
  }
}, [message]);
```

---

## 7. 数据流设计

### 7.1 聊天数据流

```
用户输入
  ↓
ChatInput → handleSubmit
  ↓
useChat Hook → POST /api/chat
  ↓
Next.js API Route → OpenRouter API (AI SDK)
  ↓
SSE Stream ← AI Response (流式)
  ↓
useChat Hook 更新 messages 状态
  ↓
MessageList 实时渲染新消息
```

### 7.2 iframe控制流

```
AI消息包含 [OPEN_URL:xxx]
  ↓
parseURLFromMessage 解析URL
  ↓
onOpenUrl 回调触发
  ↓
IframeContainer 更新 src
  ↓
iframe加载新URL
```

---

## 8. 类型定义

```typescript
// types/chat.ts
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
}

// types/iframe.ts
export interface IframeState {
  url: string;
  isLoading: boolean;
  error: Error | null;
}

export interface IframeControls {
  setUrl: (url: string) => void;
  reload: () => void;
  goBack: () => void;
  goForward: () => void;
}
```

---

## 9. 安全考虑

### 9.1 iframe安全
```typescript
// iframe 沙箱设置
<iframe
  src={url}
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  referrerPolicy="no-referrer"
/>
```

### 9.2 API密钥保护
- OpenRouter API Key 存储在服务端环境变量
- 前端永远不直接暴露API Key
- 使用 Next.js API Routes 作为代理

### 9.3 内容安全策略 (CSP)
```typescript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  frame-src *;
  connect-src 'self' https://openrouter.ai;
`;
```

---

## 10. 性能优化

### 10.1 前端优化
- 使用 React.memo 优化消息列表渲染
- 虚拟滚动（如消息超过100条）
- 图片懒加载
- Code splitting

### 10.2 API优化
- 流式响应减少首字延迟
- 请求去重
- 错误重试机制

---

## 11. 开发计划

### Phase 1: 基础框架 (Day 1-2)
- [ ] 初始化 Next.js 项目
- [ ] 配置 Tailwind CSS
- [ ] 安装 Shadcn/ui
- [ ] 搭建基础布局结构

### Phase 2: 聊天功能 (Day 3-4)
- [ ] 实现聊天UI组件
- [ ] 集成 AI SDK v5
- [ ] 配置 OpenRouter API
- [ ] 实现流式响应

### Phase 3: iframe集成 (Day 5)
- [ ] 实现 iframe 容器
- [ ] URL 控制功能
- [ ] AI消息解析URL

### Phase 4: 优化和测试 (Day 6-7)
- [ ] 响应式设计
- [ ] 错误处理
- [ ] 性能优化
- [ ] 用户体验打磨

---

## 12. 启动命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

---

## 13. 关键依赖包

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "ai": "^5.0.0",
    "@ai-sdk/openai": "^1.0.0",
    "openai": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.344.0",
    "react-markdown": "^9.0.0",
    "react-syntax-highlighter": "^15.5.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 14. 参考资源

- [Next.js 14 文档](https://nextjs.org/docs)
- [Vercel AI SDK v5](https://sdk.vercel.ai/docs)
- [OpenRouter API](https://openrouter.ai/docs)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**文档版本**: v1.0
**最后更新**: 2025-10-11
**作者**: Claude Code
