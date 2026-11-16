import { defineConfig, devices } from "@playwright/test";

// E2E runs against the real Go backend (BACKEND_URL, default http://localhost:9999)
// and needs the seeded admin: E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD, from the environment
// or from .env.e2e.local (git-ignored by .env*, never committed).
try {
  process.loadEnvFile(".env.e2e.local");
} catch {
  // No local file: use the environment as-is.
}

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000/login",
    reuseExistingServer: true,
  },
});
