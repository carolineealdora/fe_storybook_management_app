/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type Plugin } from "vite";

// The dev server forwards /api/v1 to the Go backend, so the browser stays same-origin.
const backend = process.env.BACKEND_URL ?? "http://localhost:9999";

/**
 * Content-Security-Policy for the built app (the main defence for the tokens in localStorage).
 * Build only: the dev server injects inline scripts for hot reload. Policies that need a
 * response header (frame-ancestors) are set by the web server: deploy/nginx/security-headers.conf.
 */
function contentSecurityPolicy(apiUrl: string | undefined): Plugin {
  const apiOrigin = apiUrl?.startsWith("http")
    ? ` ${new URL(apiUrl).origin}`
    : "";
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' blob:", // covers load as blob: object URLs
    `connect-src 'self'${apiOrigin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  return {
    name: "content-security-policy",
    apply: "build",
    transformIndexHtml: () => [
      {
        tag: "meta",
        attrs: { "http-equiv": "Content-Security-Policy", content: policy },
        injectTo: "head-prepend",
      },
    ],
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    contentSecurityPolicy(loadEnv(mode, process.cwd()).VITE_API_URL),
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: { port: 3000, proxy: { "/api": backend } },
  preview: { port: 3000, proxy: { "/api": backend } },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
}));
