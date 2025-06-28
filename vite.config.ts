import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://chezblos-back.onrender.com", // Port par défaut du serveur backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
