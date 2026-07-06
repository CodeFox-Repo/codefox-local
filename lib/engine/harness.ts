/**
 * Harness runtime for local CLI engines (Claude Code / Codex), adapted from
 * kobe `packages/kobe/src/engine/ai-sdk/harness-turn.ts`.
 *
 * `HarnessAgent` + `createClaudeCode()` / `createCodex()` drive the
 * locally-installed CLI runtime through a bridge; `createLocalSandbox` makes
 * that bridge run ON THIS MACHINE rooted at the project directory, so the
 * runtime reuses the local `claude` / `codex` subscription login — no API key.
 * The runtime owns its own coding tools (bash/read/edit/…); it edits the
 * project files directly.
 *
 * One runtime per (vendor, projectDir); the harness session is stateful, so
 * each turn only needs the newest user prompt, not the whole history.
 */

import { createClaudeCode } from "@ai-sdk/harness-claude-code";
import { createCodex } from "@ai-sdk/harness-codex";
import { HarnessAgent } from "@ai-sdk/harness/agent";
import { createLocalSandbox } from "./local-sandbox";

export type HarnessVendor = "claude" | "codex";

interface ProjectRuntime {
  agent: HarnessAgent;
  session?: Awaited<ReturnType<HarnessAgent["createSession"]>>;
  busy: boolean;
}

// The bridge keeps a child process alive per runtime — stash the map on
// globalThis so Next.js dev HMR module reloads don't orphan live bridges.
const globalStore = globalThis as unknown as { __codefoxHarnessRuntimes?: Map<string, ProjectRuntime> };
const runtimes = (globalStore.__codefoxHarnessRuntimes ??= new Map<string, ProjectRuntime>());

function ensureRuntime(vendor: HarnessVendor, projectDir: string): ProjectRuntime {
  const key = `${vendor}:${projectDir}`;
  const existing = runtimes.get(key);
  if (existing) return existing;
  const runtime: ProjectRuntime = {
    agent: new HarnessAgent({
      harness: vendor === "codex" ? createCodex() : createClaudeCode(),
      sandbox: createLocalSandbox({ workRoot: projectDir }),
    }),
    busy: false,
  };
  runtimes.set(key, runtime);
  return runtime;
}

export interface HarnessTurnOpts {
  vendor: HarnessVendor;
  projectDir: string;
  prompt: string;
}

/**
 * Run one turn against the project's harness runtime and return the
 * UIMessage stream as an HTTP Response (same wire format as streamText's
 * toUIMessageStreamResponse, so the useChat client is engine-agnostic).
 */
export async function streamHarnessTurn({ vendor, projectDir, prompt }: HarnessTurnOpts): Promise<Response> {
  const runtime = ensureRuntime(vendor, projectDir);
  if (runtime.busy) {
    return Response.json({ error: "Engine is busy with a previous request for this project" }, { status: 429 });
  }
  runtime.busy = true;
  try {
    runtime.session ??= await runtime.agent.createSession();
    const result = await runtime.agent.stream({
      session: runtime.session,
      prompt,
    });
    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      // ponytail: busy resets when the response stream finishes or errors; a
      // client that vanishes mid-stream leaves it set until the bridge turn
      // completes — acceptable for a single-user local app.
      onFinish: () => {
        runtime.busy = false;
      },
      onError: (error) => {
        runtime.busy = false;
        return error instanceof Error ? error.message : String(error);
      },
    });
  } catch (error) {
    runtime.busy = false;
    throw error;
  }
}
