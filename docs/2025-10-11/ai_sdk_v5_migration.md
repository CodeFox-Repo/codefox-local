# AI SDK v5 Migration Summary

## ✅ Completed Migration

We successfully migrated the project to AI SDK v5, using the latest API and architecture.

### Core Changes

#### 1. **Using AI SDK v5's useChat Hook**

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

**Key Points:**
- ✅ Use `@ai-sdk/react` package (not `ai/react`)
- ✅ Use `DefaultChatTransport` to configure API endpoint
- ✅ `sendMessage` replaces old `handleSubmit`
- ✅ `status` replaces `isLoading` (values: `'streaming'` | `'ready'` etc.)

#### 2. **Manual Input State Management**

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

**Key Points:**
- ✅ No longer have built-in `input` and `handleInputChange`
- ✅ Use `useState` to manually manage input
- ✅ `sendMessage` accepts UIMessage format (with `parts` array)

#### 3. **UIMessage Format Conversion**

```tsx
// AI SDK v5 uses UIMessage format
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

**Key Points:**
- ✅ UIMessage uses `parts` array (not single `content` string)
- ✅ Each part has `type` and corresponding data
- ✅ Need to convert to old format for compatibility with existing components

#### 4. **API Route Update**

```tsx
import { streamText, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Convert UIMessages to ModelMessages
  const modelMessages = convertToModelMessages(messages);

  const result = streamText({
    model: openrouter("anthropic/claude-3.5-sonnet"),
    messages: modelMessages,
    system: SYSTEM_PROMPT,
  });

  // Return UIMessage stream response
  return result.toUIMessageStreamResponse({
    originalMessages: messages,
  });
}
```

**Key Points:**
- ✅ Use `convertToModelMessages` to convert message format
- ✅ Use `toUIMessageStreamResponse()` instead of `toDataStreamResponse()`
- ✅ Pass `originalMessages` to maintain complete chat history

## 📦 Dependencies

```json
{
  "dependencies": {
    "ai": "^5.0.68",
    "@ai-sdk/react": "^2.0.68",
    "@ai-sdk/openai": "^2.0.49"
  }
}
```

## 🎯 AI SDK v5 Advantages

### 1. **Separation of UI and Model Messages**
- `UIMessage`: Source of truth for UI state, contains complete history
- `ModelMessage`: Streamlined format sent to LLM

### 2. **Type-Safe Data Parts**
- Can stream arbitrary type-safe data
- End-to-end type checking from server to client

### 3. **Improved Tool Calling**
- Each tool has specific part type `tool-TOOLNAME`
- Automatic streaming inputs
- Explicit error states

### 4. **Message Metadata**
- Type-safe metadata attached to messages
- Model ID, token counts, etc.

### 5. **Modular Architecture**
- Custom Transport implementations
- Decoupled state management
- Framework-agnostic Chat class

## 🔄 Old API vs New API Comparison

| Feature | AI SDK v3/v4 | AI SDK v5 |
|---------|-------------|-----------|
| Import | `ai/react` | `@ai-sdk/react` |
| Input Management | `input`, `handleInputChange` | Manual `useState` |
| Submit | `handleSubmit` | `sendMessage(message)` |
| Loading | `isLoading` (boolean) | `status` ('streaming' \| 'ready') |
| Message Format | `{ role, content }` | `{ role, parts: [...] }` |
| API Response | `toDataStreamResponse()` | `toUIMessageStreamResponse()` |
| Message Conversion | Not needed | `convertToModelMessages()` |

## 🚀 Next Steps

Now that the project is fully migrated to AI SDK v5, you can:

1. **Configure OpenRouter API Key**
   ```bash
   # Edit .env.local
   OPENROUTER_API_KEY=sk-or-v1-xxxxx
   ```

2. **Start Development Server**
   ```bash
   bun run dev
   ```

3. **Test Chat Functionality**
   - Open http://localhost:3000
   - Test message sending
   - Test URL opening functionality

4. **Explore v5 New Features**
   - Data Parts (streaming custom data)
   - Tool Calling (type-safe tool invocation)
   - Message Metadata (attach metadata)
   - Agentic Loop Control (agent control)

## 📚 Reference Resources

- [AI SDK v5 Official Documentation](https://ai-sdk.dev/docs)
- [AI SDK v5 Release Blog](https://vercel.com/blog/ai-sdk-5)
- [Migration Guide](https://ai-sdk.dev/docs/migration)
- [GitHub Repository](https://github.com/vercel/ai)

---

**Migration Completed**: 2025-10-11
**AI SDK Version**: 5.0.68
**Status**: ✅ Success
