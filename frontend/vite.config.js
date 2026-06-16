import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
        credentials: true,
        headers: {
          "Origin": "http://localhost:5173",
          "Access-Control-Allow-Credentials": "true"
        },
        onProxyRes: (proxyRes, req, res) => {
          proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
        }
      },
    },
  },
});
