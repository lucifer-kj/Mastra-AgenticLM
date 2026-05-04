import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@mastra/core",
    "mastra",
    "duckdb",
    "@duckdb/duckdb-wasm",
    "@duckdb/node-api",
    "@duckdb/node-bindings",
    "@mastra/duckdb",
    "@mastra/libsql"
  ],
};

export default nextConfig;
