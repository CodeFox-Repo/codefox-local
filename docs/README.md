# CodeFox Chat 文档

欢迎来到 CodeFox Chat 项目文档！

## 📚 文档目录

### 核心文档

1. **[设计文档 (DESIGN_DOC.md)](./DESIGN_DOC.md)**
   - 项目概述和技术栈
   - 完整的系统架构设计
   - 前端页面布局设计
   - 后端 API 设计
   - 组件设计和数据流
   - 开发计划

2. **[AI SDK v5 迁移指南 (AI_SDK_V5_MIGRATION.md)](./AI_SDK_V5_MIGRATION.md)**
   - AI SDK v5 迁移总结
   - 核心 API 变更
   - 旧版 vs 新版对比
   - 类型安全和新特性
   - 实际代码示例

## 🎯 快速链接

### 技术栈

- **框架**: Next.js 15 (App Router)
- **运行时**: Bun
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **AI SDK**: Vercel AI SDK v5
- **AI 模型**: Claude Sonnet 4.5 (via OpenRouter)

### 主要特性

- 🎨 **Geek 风格**: 黑色主题 + 橙色点缀 (#ff6b35)
- 💬 **AI 聊天**: 流式响应，Markdown 支持
- 🌐 **智能 iframe**: AI 可直接控制网页打开
- 🔄 **可调整布局**: 拖拽分隔条调整面板大小
- 🎯 **类型安全**: 端到端 TypeScript

## 🚀 快速开始

```bash
# 安装依赖
bun install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加 OpenRouter API Key

# 启动开发服务器
bun run dev
```

打开 [http://localhost:3000](http://localhost:3000) 开始使用！

## 📁 项目结构

```
codefox-local/
├── app/                    # Next.js App Router
│   ├── api/chat/          # AI 聊天 API
│   ├── page.tsx           # 主页面
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式（主题配置）
├── components/            # React 组件
│   ├── chat/             # 聊天相关组件
│   ├── iframe/           # iframe 组件
│   └── layout/           # 布局组件
├── lib/                  # 工具函数
├── types/                # TypeScript 类型
├── hooks/                # React Hooks
├── docs/                 # 📖 项目文档（当前目录）
└── public/               # 静态资源
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License

---

**文档更新时间**: 2025-10-11
**项目版本**: v1.0.0
**维护者**: CodeFox Team
