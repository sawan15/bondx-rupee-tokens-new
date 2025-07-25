import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081, // Updated to 8081 to avoid backend conflict
    allowedHosts: [
      "localhost",
      "127.0.0.1", 
      "e4d19e5bdf89.ngrok-free.app",
      ".ngrok-free.app", // Allow any ngrok subdomain
    ],
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
