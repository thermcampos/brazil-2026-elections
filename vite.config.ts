import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: ["flattop-depth-dropper.ngrok-free.dev"],
  },
  preview: {
    allowedHosts: ["flattop-depth-dropper.ngrok-free.dev"],
  },
});
