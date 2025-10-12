# CodeFox Local - AI Website Generator

An AI-powered local website project generator that allows users to create complete website code through natural language descriptions with real-time preview.

## Tech Stack

- **Framework**: Next.js 15.5.4 (with Turbopack)
- **UI Library**: React 19.1.0
- **State Management**: Zustand 5.0.8
- **AI SDK**: @ai-sdk/react 2.0.68, @ai-sdk/openai 2.0.49
- **UI Components**: Radix UI + Tailwind CSS 4
- **Code Highlighting**: react-syntax-highlighter
- **Markdown Rendering**: react-markdown
- **Package Manager**: bun

## Coding Standards

- **No `any` type**: Avoid using `any` type in the project. Always use explicit types or proper TypeScript generics.

## Development Environment

- **Server is always running on localhost:3000**: The user always has the development server running on `localhost:3000`. If you need to test any page-related functionality, you can use `curl` to make requests.