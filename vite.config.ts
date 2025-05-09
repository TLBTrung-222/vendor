import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // Allow hosting on network (e.g., ngrok)
        allowedHosts: [
            "8d00-2a09-bac5-d469-18d2-00-279-ab.ngrok-free.app", // Replace with your ngrok host
        ],
    },
});
