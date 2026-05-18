import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig(({ mode }) => ({
  server: {
    proxy: {
      '/api-kheti': {
        target: 'https://smartkheti.co.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-kheti/, ''),
      }
    }
  },
  preview: {
    proxy: {
      '/api-kheti': {
        target: 'https://smartkheti.co.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-kheti/, ''),
      }
    }
  },
  plugins: [react(), viteCommonjs(), mode === "development" && componentTagger()].filter(Boolean),
  define: {
    'global': 'window', 
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));