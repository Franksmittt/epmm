import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** `portal/` — this file lives here */
const portalRoot = path.dirname(fileURLToPath(import.meta.url));
/** Repo root (`endpoint_media_meta/`) — npm workspaces hoist `next` + `tailwindcss` here */
const monorepoRoot = path.resolve(portalRoot, "..");

const nextConfig: NextConfig = {
  // Workspaces: deps live in ../node_modules; Turbopack must use monorepo root to resolve `next` and Tailwind.
  turbopack: {
    root: monorepoRoot,
  },
  // React Compiler + Next 16 dev/Turbopack can trigger E668 ("Router action
  // dispatched before initialization") by affecting render ordering; keep off until stable.
  reactCompiler: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
