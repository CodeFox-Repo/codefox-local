# CodeFox Chat 🦊

A sleek, geek-style chat application with AI assistant and integrated web preview. Built with Next.js 15, Bun, and Claude Sonnet 4.5.

## 🎨 Features

- **Split View Interface**: Chat on the left (40%), iframe preview on the right (60%)
- **AI-Powered Chat**: Powered by Claude Sonnet 4.5 via OpenRouter API
- **Smart URL Opening**: AI can open websites directly in the iframe viewer
- **Geek Theme**: Dark theme with orange accents (#ff6b35)
- **Resizable Panels**: Drag the separator to adjust panel sizes
- **Streaming Responses**: Real-time AI responses with SSE
- **Markdown Support**: Rich text formatting and code highlighting
- **Responsive Design**: Works on desktop and mobile

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Bun
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI SDK**: Vercel AI SDK v5
- **AI Model**: Claude Sonnet 4.5 (via OpenRouter)
- **Icons**: Lucide React
- **Markdown**: react-markdown + react-syntax-highlighter

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd codefox-local

# Install dependencies
bun install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local and add your OpenRouter API key
```

## 🔑 Configuration

Create a `.env.local` file with your OpenRouter API key:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
NEXT_PUBLIC_DEFAULT_MODEL=anthropic/claude-sonnet-4.5
NEXT_PUBLIC_APP_NAME=CodeFox Chat
```

Get your OpenRouter API key from: https://openrouter.ai/

## 🎯 Usage

```bash
# Development mode
bun run dev

# Production build
bun run build

# Start production server
bun run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💡 How It Works

### AI URL Opening

The AI assistant can open websites using a special marker format:

```
User: "Open Google"
AI: "Sure! [OPEN_URL:https://www.google.com]"
```

The frontend automatically detects `[OPEN_URL:...]` markers and opens the URL in the iframe viewer.

### Key Components

- **MainLayout**: Resizable split-pane layout
- **ChatContainer**: Chat interface with messages and input
- **IframeContainer**: Web preview with URL controls
- **ChatMessage**: Individual message with markdown rendering
- **API Route**: `/api/chat` - Handles streaming AI responses

## 🎨 Theming

The app uses a custom dark theme with orange accents. Main colors:

- Background: `#0a0a0a`
- Primary (Orange): `#ff6b35`
- Gray Scale: Various shades from `#0a0a0a` to `#fafafa`

Customize colors in [app/globals.css](app/globals.css).

## 📖 Documentation

- **[设计文档](docs/DESIGN_DOC.md)** - 完整的技术设计和架构说明
- **[AI SDK v5 迁移指南](docs/AI_SDK_V5_MIGRATION.md)** - AI SDK v5 迁移详情和 API 变更

## 📁 Project Structure

```
codefox-local/
├── app/
│   ├── api/chat/route.ts      # AI chat API endpoint
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Main page
│   └── globals.css            # Global styles
├── components/
│   ├── chat/                  # Chat components
│   ├── iframe/                # iframe components
│   └── layout/                # Layout components
├── lib/
│   └── utils.ts               # Utility functions
├── types/
│   ├── chat.ts                # Chat type definitions
│   └── iframe.ts              # iframe type definitions
└── public/                    # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

## 🙏 Credits

- Built with [Next.js](https://nextjs.org/)
- Powered by [Claude AI](https://anthropic.com/)
- API via [OpenRouter](https://openrouter.ai/)
- UI components inspired by shadcn/ui

---

Made with 💚 by CodeFox
