import { defineConfig } from "@playwright/test";

export const TEST_SESSION_SECRET = "test-only-room-session-secret-with-32-characters";
export const TEST_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:55432/postgres?connection_limit=1";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  fullyParallel: false,
  timeout: 30000,
  use: { baseURL: "http://127.0.0.1:3100", browserName: "chromium", channel: process.env.PLAYWRIGHT_CHANNEL || "chrome", trace: "retain-on-failure" },
  webServer: [
    { command: "node tests/support/test-db.mjs", port: 55432, timeout: 60000, reuseExistingServer: false },
    { command: "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 -p 3100", url: "http://127.0.0.1:3100", timeout: 60000, reuseExistingServer: false, env: { DATABASE_URL: TEST_DATABASE_URL, SESSION_SECRET: TEST_SESSION_SECRET, SESSION_COOKIE_NAME: "session" } },
  ],
});
