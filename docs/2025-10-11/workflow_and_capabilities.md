# CodeFox Local - Workflow & Agent Capabilities

## Project Creation Workflow

### 1. Initial Setup
```
User describes website → Create project → Initialize directory → Start conversation
```

**Flow:**
1. User enters description in chat input
2. System creates project: `website-{timestamp}`
3. Project directory created at: `.projects/project-{id}/`
4. Project added to history automatically
5. AI receives message and starts generating

### 2. Project Structure
```
.projects/
  └── project-{id}/
      ├── index.html
      ├── styles.css
      ├── script.js
      └── ... (other files)
```

## AI Agent Capabilities

### Available Tools

#### 1. **executeCommand**
Execute shell commands in the project directory.

**Use Cases:**
- Install dependencies: `bun install`, `npm install`
- Start dev server: `bun run dev`, `npm run dev`, `vite`
- Run build: `bun run build`
- Git operations: `git init`, `git add .`, `git commit`
- File operations: `ls`, `cat package.json`

**Features:**
- `keepAlive: true` - Keep process running in background (for dev servers)
- Captures stdout/stderr
- Auto-detects preview URL from output

**Example:**
```typescript
executeCommand({
  command: "bun run dev",
  keepAlive: true
})
```

#### 2. **writeFile**
Write content to files in the project directory.

**Use Cases:**
- Create HTML files
- Create CSS stylesheets
- Create JavaScript files
- Create configuration files (package.json, vite.config.js, etc.)
- Update existing files

**Example:**
```typescript
writeFile({
  path: "index.html",
  content: "<!DOCTYPE html>..."
})
```

#### 3. **setPreviewUrl**
Update the preview iframe URL (client-side tool).

**Use Cases:**
- Point to dev server: `http://localhost:5173`
- Point to different port: `http://localhost:3000`

**Example:**
```typescript
setPreviewUrl({
  url: "http://localhost:5173"
})
```

### Agent Behavior

#### System Prompt Guidelines
The AI agent is configured to:

1. **Explore projects first**
   - Use `executeCommand({ command: "ls -la" })` to see structure
   - Use `executeCommand({ command: "cat package.json" })` to check dependencies

2. **Use bun as package manager**
   - Prefer `bun install` over `npm install`
   - Prefer `bun run` over `npm run`

3. **Start dev servers with keepAlive**
   - Always use `keepAlive: true` for long-running processes
   - Example: `executeCommand({ command: "bun run dev", keepAlive: true })`

4. **Set preview URL after starting server**
   - Parse the dev server output for URL
   - Call `setPreviewUrl({ url: "http://localhost:5173" })`

## Project History & Snapshots

### Snapshot System

Each project saves a complete state snapshot:
- **Messages**: Full conversation history (UIMessage[])
- **Preview URL**: Dev server URL
- **Project Info**: Name, path, created date
- **Last Accessed**: Timestamp of last use

### Switching Projects

When switching between projects:
1. Current project snapshot is saved automatically
2. Target project snapshot is loaded
3. Messages are restored to chat UI
4. Preview URL is restored to iframe
5. localStorage is updated

### Persistence

**Saved to localStorage:**
- Project snapshots (up to 20 recent projects)
- Current project ID

**Not persisted:**
- Real-time chat input
- Loading states
- Temporary UI state

## Common Workflows

### Creating a React + Vite Project

```
1. AI creates package.json with dependencies
2. AI runs: bun install
3. AI creates vite.config.js
4. AI creates src/main.jsx, src/App.jsx
5. AI creates index.html
6. AI runs: bun run dev (keepAlive: true)
7. AI calls: setPreviewUrl({ url: "http://localhost:5173" })
8. User sees live preview in iframe
```

### Creating a Static HTML Site

```
1. AI creates index.html
2. AI creates styles.css
3. AI creates script.js
4. Preview shows static files directly (no dev server needed)
```

### Adding Features to Existing Project

```
1. AI explores: ls -la
2. AI reads: cat package.json
3. AI installs new dependencies: bun add <package>
4. AI updates files: writeFile({ path: "...", content: "..." })
5. AI restarts dev server (if needed)
6. Changes appear in preview
```

## UI Features

### Left Panel - Chat
- Message history with tool calls
- Tool execution visualization
- Input field with Enter to send
- Auto-scroll to latest message

### Right Panel - Preview
- **Preview Tab**: Live iframe preview
- **Code Tab**: Syntax-highlighted code view
- Refresh button
- Open in new tab button

### Top Bar
- **History Icon** (left): Access project history
- **Title**: "Website Generator"
- **Settings Icon** (right): Open settings modal

### Project History Dialog
- Shows recent projects (up to 20)
- Sorted by last accessed time
- Shows project name, path, relative time
- "Active" badge for current project
- Click to switch projects
- Hover to show delete button
- "Clear All" button in header

## Settings

### General
- Theme (Light/Dark/System)
- Font Size (Small/Medium/Large)

### AI Settings
- Provider (OpenAI/OpenRouter)
- API Key (stored locally)
- Model ID
- Temperature (0-2)
- Max Tokens (100-8192)

### Projects
- Default project path
- Auto-save toggle
- Auto-preview toggle

### Advanced
- Default dev server port
- Auto-open browser toggle
- Clear chat history
- Reset all settings

## Technical Architecture

### State Management (Zustand)

```typescript
{
  currentProjectId: string | null
  projectSnapshots: Record<string, ProjectSnapshot>
  messages: UIMessage[]
  iframeUrl: string
  input: string
  isLoading: boolean
}
```

### API Routes

1. **POST /api/chat**
   - Streams AI responses
   - Executes server-side tools
   - Returns tool results

2. **POST /api/project/create**
   - Creates project directory
   - Returns project info

### Tool Execution Flow

```
User message
  → AI generates tool call
  → Server executes tool (writeFile/executeCommand)
  → Server returns result
  → AI receives result
  → AI continues generation
  → Client-side tool (setPreviewUrl) executes in browser
```

## Dev Server Detection

The system auto-detects dev server URLs from common patterns:

- Vite: `Local: http://localhost:5173`
- Next.js: `http://localhost:3000`
- Create React App: `http://localhost:3000`
- Generic: `http://localhost:{port}`

When detected, automatically calls `setPreviewUrl`.

## File Paths

All file operations are relative to the project directory:
- ✅ `index.html` → `.projects/project-123/index.html`
- ✅ `src/App.jsx` → `.projects/project-123/src/App.jsx`
- ❌ `/absolute/path` → Not allowed

## Error Handling

### Tool Execution Errors
- Displayed in tool call UI with red error message
- Does not crash the app
- AI can retry or adjust approach

### API Errors
- Toast notification shown to user
- Error logged to console
- Chat input remains available

### Project Creation Errors
- Toast notification: "Failed to initialize project"
- User can retry by sending message again
