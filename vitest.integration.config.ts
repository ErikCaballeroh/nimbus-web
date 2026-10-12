import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgresql://nimbus:nimbus@localhost:5432/nimbus_test?schema=public",
    },
  },
  resolve: {
    alias: {
      // See vitest.server-only-stub.ts for why this is stubbed out here.
      "server-only": path.resolve(__dirname, "vitest.server-only-stub.ts"),
    },
  },
});
