// Stand-in for the "server-only" package in integration tests: Vitest runs
// outside Next's "react-server" bundler condition, so the real package
// would throw unconditionally. The guard it provides is a build-time
// safety net against accidental client bundling, not something these
// Node-environment tests need to enforce.
export {};
