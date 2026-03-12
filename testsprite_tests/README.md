# TestSprite Tests

This directory contains the AI-generated test suite for Sentimeter.
These tests use the TestSprite MCP to cover the Dashboard UI, the Convex HTTP action API, and the Widget components.

## Hackathon proof (how to regenerate)

This repo uses **TestSprite MCP** (not just a library install). To (re)generate the suite:

1. Ensure the web app is running locally on `http://localhost:3000`.
2. Run:
   - `bun testsprite_tests/run_mcp.mjs`

The runner will:
- Launch the TestSprite MCP server via `npx @testsprite/testsprite-mcp@latest`
- Walk through the MCP workflow (bootstrap → PRD → test plan → generate+execute)
- Write artifacts into `testsprite_tests/`

Notes:
- `testsprite_tests/tmp/` is intentionally gitignored (it may contain config/run metadata).
- Generated test cases and reports under `testsprite_tests/` should be committed for judging.
