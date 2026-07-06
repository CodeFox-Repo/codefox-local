import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The harness packages resolve their bridge script from their own package
  // dir at runtime (import.meta.url) — they must stay unbundled.
  serverExternalPackages: [
    "@ai-sdk/harness",
    "@ai-sdk/harness-claude-code",
    "@ai-sdk/harness-codex",
  ],
};

export default nextConfig;
