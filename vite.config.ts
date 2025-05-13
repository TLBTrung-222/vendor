import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // Allow hosting on network (e.g., ngrok)
        allowedHosts: true,
    },
});
