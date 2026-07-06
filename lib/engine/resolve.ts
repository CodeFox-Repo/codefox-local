/**
 * Engine resolution: which AI engine backs this codefox-local process.
 *
 * Order: explicit `CODEFOX_ENGINE` override → locally logged-in Claude Code →
 * locally logged-in Codex → OpenRouter (needs OPENROUTER_API_KEY).
 * Resolution is cached per process — restart the dev server to re-detect.
 */

import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export type EngineChoice = "claude" | "codex" | "openrouter";

function onPath(bin: string): boolean {
  return (process.env.PATH ?? "")
    .split(path.delimiter)
    .some((dir) => dir && existsSync(path.join(dir, bin)));
}

function readJson(p: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readFileSync(p, "utf-8"));
  } catch {
    return null;
  }
}

/** Claude Code login = `claude` on PATH + `oauthAccount` in ~/.claude.json. */
function claudeAvailable(): boolean {
  if (!onPath("claude")) return false;
  const config = readJson(path.join(os.homedir(), ".claude.json"));
  return config != null && "oauthAccount" in config;
}

/** Codex login = `codex` on PATH + tokens or an API key in ~/.codex/auth.json. */
function codexAvailable(): boolean {
  if (!onPath("codex")) return false;
  const auth = readJson(path.join(os.homedir(), ".codex", "auth.json"));
  return auth != null && (auth.tokens != null || auth.OPENAI_API_KEY != null);
}

let cached: EngineChoice | undefined;

export function resolveEngine(): EngineChoice {
  if (cached) return cached;

  const override = process.env.CODEFOX_ENGINE;
  if (override) {
    if (override !== "claude" && override !== "codex" && override !== "openrouter") {
      throw new Error(`Invalid CODEFOX_ENGINE "${override}" — expected claude | codex | openrouter`);
    }
    cached = override;
    return cached;
  }

  if (claudeAvailable()) cached = "claude";
  else if (codexAvailable()) cached = "codex";
  else if (process.env.OPENROUTER_API_KEY) cached = "openrouter";
  else {
    throw new Error(
      "No AI engine available. Install and log in to the `claude` or `codex` CLI, " +
        "or set OPENROUTER_API_KEY. Force a specific engine with CODEFOX_ENGINE=claude|codex|openrouter."
    );
  }
  return cached;
}
