import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Tailwind v4 se integra como plugin de Vite: no hace falta tailwind.config.js ni postcss.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
