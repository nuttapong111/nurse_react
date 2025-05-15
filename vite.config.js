import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/", // ✅ สำคัญมากเวลาสร้าง static assets
  plugins: [react()],
  server: {
    port: 5173,
  },
});
