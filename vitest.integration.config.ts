import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    env: {
      // Always the test database, regardless of what DATABASE_URL is set to
      // in the environment (e.g. inside the dockerized dev app, where it
      // points at the dev database) — integration tests must never touch
      // dev data.
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        "postgresql://nimbus:nimbus@localhost:5432/nimbus_test?schema=public",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // See vitest.server-only-stub.ts for why this is stubbed out here.
      "server-only": path.resolve(__dirname, "vitest.server-only-stub.ts"),
    },
  },
});
