# Sentimeter Documentation

This directory is the index for human-facing project documentation. Code remains
the source of truth; docs should point to current implementation paths and be
updated or deleted when behavior changes.

## Start Here

- [Project README](../README.md) - registry launch overview, setup, and commands.
- [Changelog](../CHANGELOG.md) - public release history.
- [Onboarding](onboarding.md) - practical walkthrough for working in the repo.
- [Context](../CONTEXT.md) - product and system language for larger changes.
- [Design system](../DESIGN_SYSTEM.md) - UI principles, foundations, and the widget contract.

## Architecture

- [System architecture](architecture/system-architecture.md) - runtime surfaces
  and data flow.
- [Feedback intake](architecture/feedback-intake.md) - widget submission,
  validation, CORS, rate limits, and storage for unreleased hosted analytics.
- [Registry subdomain decision](adr/0001-registry-on-own-subdomain.md) - the
  stable install URL and its Cloudflare Worker routing.

## Operations

- [Runbook](ops/runbook.md) - checks, deployment setup, domain changes, and
  first-response steps for common failures.

## Research

- [UI consistency skills assessment](research/ui-consistency-skills-assessment.md) -
  assessment of arla6ka/skills against Sentimeter's existing UI, dated 2026-10-03.
- [State machine skill assessment](research/state-machine-skill-assessment.md) -
  evaluation of the opt-in component state workbench skill.
- [Repository structure audit](research/repo-structure-audit.md) - layout,
  setup and contributor-process gaps measured against shadcn/ui, dated 2026-10-28.

## Maintenance Rules

- Keep root Markdown limited to repo instructions, product context, design
  constraints, contribution and license files, the changelog, and the README.
- Keep architecture decisions under `docs/adr/`.
- Keep architecture notes under `docs/architecture/`.
- Keep incident response and deployment notes under `docs/ops/`.
- Keep dated investigations under `docs/research/`.
