# AI SDK v5 迁移总结

## ✅ 已完成的迁移

我们成功将项目迁移到 AI SDK v5，使用了最新的 API 和架构。

### 核心变更

#### 1. **使用 AI SDK v5 的 useChat Hook**

```tsx
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({
    api: "/api/chat",
  }),
  onError: (error) => {
    console.error("Chat error:", error);
  },
});
```

**关键点：**
- ✅ 使用 `@ai-sdk/react` 包（不是 `ai/react`）
- ✅ 使用 `DefaultChatTransport` 配置 API 端点
- ✅ `sendMessage` 替代了旧的 `handleSubmit`
- ✅ `status` 替代了 `isLoading`（值为 `'streaming'` | `'ready'` 等）

#### 2. **手动管理输入状态**

```tsx
const [input, setInput] = useState("");

const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setInput(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!input.trim() || status === 'streaming') return;

  sendMessage({
    role: "user",
    parts: [
      {
        type: "text",
        text: input.trim(),
      },
    ],
  });

  setInput("");
};
```

**关键点：**
- ✅ 不再有内置的 `input` 和 `handleInputChange`
- ✅ 使用 `useState` 手动管理输入
- ✅ `sendMessage` 接受 UIMessage 格式（带 `parts` 数组）

#### 3. **UIMessage 格式转换**

```tsx
// AI SDK v5 使用 UIMessage 格式
const convertedMessages = messages.map((msg: UIMessage) => ({
  id: msg.id,
  role: msg.role,
  content: msg.parts
    .filter((part) => part.type === "text")
    .map((part) => {
      if (part.type === "text") {
        return (part as { type: "text"; text: string }).text;
      }
      return "";
    })
    .join(""),
  createdAt: new Date(),
}));
```

**关键点：**
- ✅ UIMessage 使用 `parts` 数组（不是单个 `content` 字符串）
- ✅ 每个 part 有 `type` 和对应的数据
- ✅ 需要转换为旧格式以兼容现有组件

#### 4. **API Route 更新**

```tsx
import { streamText, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // 转换 UIMessages 为 ModelMessages
  const modelMessages = convertToModelMessages(messages);

  const result = streamText({
    model: openrouter("anthropic/claude-3.5-sonnet"),
    messages: modelMessages,
    system: SYSTEM_PROMPT,
  });

  // 返回 UIMessage 流式响应
  return result.toUIMessageStreamResponse({
    originalMessages: messages,
  });
}
```

**关键点：**
- ✅ 使用 `convertToModelMessages` 转换消息格式
- ✅ 使用 `toUIMessageStreamResponse()` 替代 `toDataStreamResponse()`
- ✅ 传递 `originalMessages` 以保持完整的聊天历史

## 📦 依赖包

```json
{
  "dependencies": {
    "ai": "^5.0.68",
    "@ai-sdk/react": "^2.0.68",
    "@ai-sdk/openai": "^2.0.49"
  }
}
```

## 🎯 AI SDK v5 的优势

### 1. **分离 UI 和模型消息**
- `UIMessage`: UI 状态的真相源，包含完整历史
- `ModelMessage`: 发送给 LLM 的精简格式

### 2. **类型安全的 Data Parts**
- 可以流式传输任意类型安全的数据
- 从服务器到客户端的端到端类型检查

### 3. **改进的工具调用**
- 每个工具都有特定的 part 类型 `tool-TOOLNAME`
- 自动流式输入
- 显式错误状态

### 4. **消息元数据**
- 类型安全的元数据附加到消息
- 模型 ID、token 计数等

### 5. **模块化架构**
- 自定义 Transport 实现
- 解耦的状态管理
- 框架无关的 Chat 类

## 🔄 旧 API vs 新 API 对比

| 功能 | AI SDK v3/v4 | AI SDK v5 |
|------|-------------|-----------|
| Import | `ai/react` | `@ai-sdk/react` |
| Input 管理 | `input`, `handleInputChange` | 手动 `useState` |
| 提交 | `handleSubmit` | `sendMessage(message)` |
| Loading | `isLoading` (boolean) | `status` ('streaming' \| 'ready') |
| 消息格式 | `{ role, content }` | `{ role, parts: [...] }` |
| API 响应 | `toDataStreamResponse()` | `toUIMessageStreamResponse()` |
| 消息转换 | 不需要 | `convertToModelMessages()` |

## 🚀 下一步

现在项目已完全迁移到 AI SDK v5，你可以：

1. **配置 OpenRouter API Key**
   ```bash
   # 编辑 .env.local
   OPENROUTER_API_KEY=sk-or-v1-xxxxx
   ```

2. **启动开发服务器**
   ```bash
   bun run dev
   ```

3. **测试聊天功能**
   - 打开 http://localhost:3000
   - 测试消息发送
   - 测试 URL 打开功能

4. **探索 v5 新特性**
   - Data Parts（流式传输自定义数据）
   - Tool Calling（类型安全的工具调用）
   - Message Metadata（附加元数据）
   - Agentic Loop Control（代理控制）

## 📚 参考资源

- [AI SDK v5 官方文档](https://ai-sdk.dev/docs)
- [AI SDK v5 发布博客](https://vercel.com/blog/ai-sdk-5)
- [迁移指南](https://ai-sdk.dev/docs/migration)
- [GitHub 仓库](https://github.com/vercel/ai)

---

**迁移完成时间**: 2025-10-11
**AI SDK 版本**: 5.0.68
**状态**: ✅ 成功
