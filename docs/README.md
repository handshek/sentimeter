# Sentimeter Documentation

This directory is the index for human-facing project documentation. Code remains
the source of truth; docs should point to current implementation paths and be
updated or deleted when behavior changes.

## Start Here

- [Project README](../README.md) - product overview, setup, commands, and current
  roadmap.
- [Onboarding](onboarding.md) - practical walkthrough for working in the repo.
- [Context](../CONTEXT.md) - product and system language for larger changes.
- [Design philosophy](../DESIGN_PHILOSOPHY.md) - UI principles and constraints.

## Architecture

- [System architecture](architecture/system-architecture.md) - runtime surfaces
  and data flow.
- [Feedback intake](architecture/feedback-intake.md) - widget submission,
  validation, CORS, rate limits, and storage.

## Operations

- [Runbook](ops/runbook.md) - checks and first-response steps for common
  failures.

## Maintenance Rules

- Keep root Markdown limited to repo instructions, product context, design
  constraints, and the README.
- Keep architecture notes under `docs/architecture/`.
- Keep incident response and deployment notes under `docs/ops/`.
- Keep dated investigations under `docs/research/` if they are added later.
