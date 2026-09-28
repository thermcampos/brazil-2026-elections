import { execSync } from "node:child_process";
import { defineConfig } from "vite";

function commitHash(): string {
  if (process.env.COMMIT_SHA) return process.env.COMMIT_SHA.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "dev";
  }
}

export default defineConfig({
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash()),
  },
  server: {
    allowedHosts: ["flattop-depth-dropper.ngrok-free.dev"],
  },
  preview: {
    allowedHosts: ["flattop-depth-dropper.ngrok-free.dev"],
  },
});
