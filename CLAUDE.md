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
- **No decorative comments**: Avoid using decorative banner-style comments like `// ==================== SECTION NAME ====================`. Use simple, concise comments instead.

## Development Environment

- **Server is always running on localhost:3000**: The user always has the development server running on `localhost:3000`. If you need to test any page-related functionality, you can use `curl` to make requests.

## Project Structure

- **Generated projects directory**: `~/.codefox-local/projects/`
  - All AI-generated website projects are stored in `~/.codefox-local/projects/` directory
  - Project IDs follow the format: `project-{timestamp}`
  - **IMPORTANT**: Always use `path.join(process.env.HOME || process.cwd(), '.codefox-local', 'projects')` when referencing project paths in code
  - This keeps generated projects separate from the main codebase and avoids config file conflicts

## Common Issues to Avoid

1. **Wrong project directory path**:
   - ❌ WRONG: `path.join(process.cwd(), 'generated_projects', projectId)`
   - ❌ WRONG: `path.join(process.cwd(), '.projects', projectId)`
   - ✅ CORRECT: `path.join(process.env.HOME || process.cwd(), '.codefox-local', 'projects', projectId)`
   - Projects are stored in user's home directory to avoid config file conflicts with main codebase

2. **Next.js App Router API routes**:
   - API routes in App Router do NOT support sub-paths in the same file
   - ❌ WRONG: `/api/dev-server/route.ts` handling both `/api/dev-server` and `/api/dev-server/start`
   - ✅ CORRECT: Use HTTP methods (GET, POST, DELETE) on the same route `/api/dev-server`

3. **Date serialization in Zustand persist**:
   - Date objects are serialized to strings in localStorage
   - Always handle both Date and string types when accessing `lastAccessedAt` or `createdAt`
   - Use custom deserialization in `createJSONStorage` getItem