# Dev Server Auto Management Design

## Problem Statement

Currently, the AI needs to manually call `setPreviewUrl` to update the iframe. This has several issues:
1. AI might forget to call it
2. Requires extra tool call overhead
3. No automatic detection of dev server status
4. No cleanup when switching projects

## Proposed Solution

Replace manual `setPreviewUrl` with **automatic dev server lifecycle management** on the frontend.

## Architecture

### 1. Dev Server State (Store)

Add to Zustand store:

```typescript
interface DevServerState {
  // Dev server process info
  projectId: string | null;
  serverUrl: string | null;
  pid: number | null;
  status: 'idle' | 'starting' | 'running' | 'error';

  // Actions
  setDevServer: (projectId: string, url: string, pid: number) => void;
  clearDevServer: () => void;
  setDevServerStatus: (status: DevServerState['status']) => void;
}
```

### 2. Message Monitoring Hook

Create `useDevServerMonitor` hook that:
- Watches all tool call messages
- Detects `executeCommand` with `keepAlive: true`
- Extracts URL from stdout/stderr
- Automatically updates dev server state

```typescript
function useDevServerMonitor(messages: UIMessage[], currentProjectId: string | null) {
  useEffect(() => {
    // Scan messages for executeCommand with keepAlive
    const toolCalls = messages.filter(isToolCall);

    for (const toolCall of toolCalls) {
      if (toolCall.toolName === 'executeCommand' && toolCall.input.keepAlive) {
        // Check if output contains URL
        const url = extractUrlFromOutput(toolCall.output);
        const pid = toolCall.output?.pid;

        if (url && pid && currentProjectId) {
          // Update dev server state
          setDevServer(currentProjectId, url, pid);
        }
      }
    }
  }, [messages, currentProjectId]);
}
```

### 3. Dev Server Lifecycle Management

#### On Project Switch

```typescript
// In page.tsx or dedicated hook
useEffect(() => {
  const devServerState = useDevServerStore.getState();

  if (devServerState.projectId !== currentProjectId) {
    // Different project - check if we need to start/stop servers

    // 1. Clean up old server (if exists)
    if (devServerState.pid) {
      // Could optionally kill the process
      // For now, just clear state (process keeps running)
      clearDevServer();
    }

    // 2. Check if new project has a dev server
    // Scan messages for dev server info
    const devServerInfo = findDevServerInMessages(messages);
    if (devServerInfo) {
      setDevServer(currentProjectId, devServerInfo.url, devServerInfo.pid);
    }
  }
}, [currentProjectId]);
```

#### URL Detection Logic

```typescript
function extractUrlFromOutput(output: string): string | null {
  const patterns = [
    /Local:\s+(https?:\/\/[^\s]+)/,           // Vite
    /url:\s+(https?:\/\/[^\s]+)/,             // Next.js
    /(https?:\/\/localhost:\d+)/,             // Generic
    /http:\/\/\[::1\]:(\d+)/,                 // IPv6 localhost
  ];

  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match) {
      return match[1].replace(/\/$/, ''); // Remove trailing slash
    }
  }

  return null;
}
```

### 4. Iframe Synchronization

Update IframeContainer to use dev server state:

```typescript
function IframeContainer() {
  const devServerUrl = useDevServerStore((state) => state.serverUrl);
  const status = useDevServerStore((state) => state.status);

  return (
    <div>
      {status === 'starting' && <LoadingSpinner>Starting dev server...</LoadingSpinner>}
      {status === 'error' && <ErrorMessage>Failed to start dev server</ErrorMessage>}
      {devServerUrl && (
        <iframe src={devServerUrl} />
      )}
    </div>
  );
}
```

## Benefits

1. **No manual tool calls** - AI doesn't need to call `setPreviewUrl`
2. **Automatic detection** - Frontend detects dev server URLs from command output
3. **Project isolation** - Each project's dev server state tracked separately
4. **Clean switching** - Automatically handles state when switching projects
5. **Better UX** - Loading states, error handling, status indicators

## Implementation Steps

### Phase 1: Basic Auto-Detection ✅
- [ ] Add dev server state to store
- [ ] Create `useDevServerMonitor` hook
- [ ] Extract URL from executeCommand output
- [ ] Auto-update iframe URL

### Phase 2: Lifecycle Management
- [ ] Handle project switching
- [ ] Clear old server state
- [ ] Restore dev server state from messages
- [ ] Add status indicators (starting/running/error)

### Phase 3: Advanced Features
- [ ] Optional: Kill old processes when switching
- [ ] Health check (ping server URL)
- [ ] Auto-restart on failure
- [ ] Multiple dev servers per project (frontend + backend)

## Data Flow

```
User sends message
  ↓
AI generates executeCommand with keepAlive=true
  ↓
Command executes, returns output with URL
  ↓
useDevServerMonitor detects URL in messages
  ↓
Updates devServerState in store
  ↓
IframeContainer re-renders with new URL
  ↓
Preview shows live dev server
```

## Edge Cases

### 1. No Dev Server
- Some projects don't need dev servers (static HTML)
- Solution: Keep iframe empty or show placeholder

### 2. Multiple Dev Servers
- Frontend on :5173, Backend on :3000
- Solution: Store array of servers, let user switch tabs

### 3. Port Conflicts
- Dev server fails due to port in use
- Solution: Detect error in stderr, show error message

### 4. Process Already Running
- User manually started dev server before
- Solution: Extract URL anyway, don't start new process

## Testing Scenarios

1. **Create new project with dev server**
   - AI runs `bun run dev`
   - URL auto-detected
   - Iframe shows preview

2. **Switch between projects**
   - Project A has dev server running
   - Switch to Project B
   - Project A's URL cleared
   - Project B's URL restored (if available)

3. **Refresh page**
   - Dev server state restored from messages
   - Iframe shows correct URL

4. **Dev server fails**
   - Error shown in UI
   - User can retry

## Migration Path

1. Comment out `setPreviewUrl` tool (DONE ✅)
2. Implement dev server state in store
3. Implement useDevServerMonitor hook
4. Update IframeContainer to use state
5. Test with various project types
6. Remove `setPreviewUrl` code entirely
7. Update system prompt (remove references to setPreviewUrl)
