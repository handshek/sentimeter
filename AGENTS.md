# AGENTS.md — Sentimeter

## What is this project?

Sentimeter is a shadcn-first feedback collection system. Developers install open-code React components from the shadcn registry into their own shadcn projects, the components adapt to the host app's existing UI structure, their users submit emoji/star/thumbs reactions, and the developer sees real-time analytics on a hosted dashboard.

Read `CONTEXT.md` before domain-level refactors, architecture work, or renaming product concepts. Read `DESIGN_PHILOSOPHY.md` before UI work.

It consists of:

- A Next.js 16 dashboard (apps/web)
- A shadcn registry app (apps/registry) — Cloudflare Worker serving registry JSON so developers can `shadcn add "https://registry.handshek.workers.dev/r/emoji-feedback.json"` and have the component fit naturally into their existing shadcn project
- An embeddable widgets package (packages/widgets)

## Tech stack

- **Monorepo:** Turborepo, Bun
- **Frontend:** Next.js 16 (App Router), TypeScript, TailwindCSS v4, shadcn/ui, lucide-react icons
- **Backend & DB:** Convex (realtime database, server functions, HTTP actions)
- **Auth:** Clerk (syncs to Convex)

## Running locally

- `bun run dev` — Starts the dashboard, widgets, and Convex dev server together in the Turborepo terminal UI
- `bun run build` — Builds all packages and apps
- `bun run registry:emit` — Emits ignored Registry Item staging from canonical Widget source
- `bun run check-registry` — Builds and validates Registry Items in temporary output
- `bun run registry:build` — Builds the shadcn registry (outputs to apps/registry/public/r/\*\*); run from repo root or from apps/registry
- `bun run lint` — Lints the entire monorepo
- `bun run format` — Formats the codebase with Prettier
- `bun run check-types` — Runs type checking across the repo
- `bun run test` — Runs local unit tests
- `bun run check-env` — Checks local dashboard environment variables

**Do NOT run:** `bun run dev` (assume already running)

Only use `bun` or `bunx` for installing dependencies

## Monorepo structure

```
├── apps
│   ├── registry
│   │   ├── public
│   │   │   └── r
│   │   │   ├── emoji-feedback.json
│   │   │   ├── feedback-system.json
│   │   │   ├── like-dislike.json
│   │   │   ├── registry.json
│   │   │   └── star-rating.json
│   │   ├── .generated
│   │   │   └── sentimeter
│   │   │       ├── feedback-system
│   │   │       │   ├── compound
│   │   │       │   ├── core
│   │   │       │   ├── index.ts
│   │   │       │   └── types.ts
│   │   │       ├── emoji-feedback.tsx
│   │   │       ├── like-dislike.tsx
│   │   │       └── star-rating.tsx
│   │   ├── scripts
│   │   │   ├── registry-adapter.ts +
│   │   │   ├── registry-cli.ts +
│   │   │   ├── registry-plan.ts +
│   │   │   ├── registry-adapter.test.ts +
│   │   │   └── registry-plan.test.ts +
│   │   ├── src
│   │   │   └── index.ts +
│   │   ├── .gitignore *
│   │   ├── components.json *
│   │   ├── package.json *
│   │   ├── registry.json *
│   │   ├── README.md *
│   │   ├── tsconfig.json *
│   │   ├── worker-configuration.d.ts
│   │   └── wrangler.json
│   └── web
│       ├── app
│       │   ├── fonts
│       │   │   ├── GeistMonoVF.woff *
│       │   │   └── GeistVF.woff *
│       │   ├── components
│       │   │   └── convex-clerk-provider.tsx +
│       │   ├── dashboard
│       │   │   ├── _components
│       │   │   │   ├── panel.tsx +
│       │   │   │   ├── project-client.tsx +
│       │   │   │   ├── projects-client.tsx +
│       │   │   │   └── sync-user-gate.tsx +
│       │   │   ├── projects
│       │   │   │   └── [projectId]
│       │   │   │       └── page.tsx +
│       │   │   ├── error.tsx +
│       │   │   ├── layout.tsx +
│       │   │   └── page.tsx +
│       │   ├── sign-in
│       │   │   └── [[...sign-in]]
│       │   │       └── page.tsx +
│       │   ├── sign-up
│       │   │   └── [[...sign-up]]
│       │   │       └── page.tsx +
│       │   ├── widgets
│       │   │   └── page.tsx +
│       │   ├── favicon.ico *
│       │   ├── layout.tsx * +
│       │   └── page.tsx * +
│       ├── public
│       │   ├── file-text.svg *
│       │   ├── globe.svg *
│       │   ├── next.svg *
│       │   ├── turborepo-dark.svg *
│       │   ├── turborepo-light.svg *
│       │   ├── vercel.svg *
│       │   └── window.svg *
│       ├── convex
│       │   ├── _generated
│       │   │   ├── api.d.ts +
│       │   │   ├── api.js +
│       │   │   ├── dataModel.d.ts +
│       │   │   ├── server.d.ts +
│       │   │   └── server.js +
│       │   ├── lib
│       │   │   ├── auth.ts +
│       │   │   └── nanoid.ts +
│       │   ├── README.md
│       │   ├── auth.config.ts +
│       │   ├── feedback.ts +
│       │   ├── http.ts +
│       │   ├── httpActions.ts +
│       │   ├── projects.ts +
│       │   ├── schema.ts +
│       │   ├── tsconfig.json
│       │   └── users.ts +
│       ├── .gitignore *
│       ├── README.md *
│       ├── components.json *
│       ├── eslint.config.js * +
│       ├── next.config.js * +
│       ├── package.json *
│       ├── postcss.config.mjs *
│       ├── tsconfig.json *
│       └── proxy.ts +
├── packages
│   ├── eslint-config
│   │   ├── README.md *
│   │   ├── base.js * +
│   │   ├── next.js * +
│   │   ├── package.json *
│   │   └── react-internal.js * +
│   ├── typescript-config
│   │   ├── base.json *
│   │   ├── nextjs.json *
│   │   ├── package.json *
│   │   └── react-library.json *
│   ├── ui
│   │   ├── src
│   │   │   ├── components
│   │   │   │   ├── button.tsx * +
│   │   │   │   ├── badge.tsx +
│   │   │   │   ├── card.tsx +
│   │   │   │   ├── chart.tsx +
│   │   │   │   ├── input.tsx +
│   │   │   │   ├── label.tsx +
│   │   │   │   ├── progress.tsx +
│   │   │   │   ├── select.tsx +
│   │   │   │   ├── separator.tsx +
│   │   │   │   ├── switch.tsx +
│   │   │   │   ├── table.tsx +
│   │   │   │   ├── tabs.tsx +
│   │   │   │   └── textarea.tsx +
│   │   │   ├── lib
│   │   │   │   └── utils.ts * +
│   │   │   └── styles
│   │   │       └── globals.css *
│   │   ├── components.json *
│   │   ├── package.json *
│   │   └── tsconfig.json *
│   └── widgets
│       ├── src
│       │   ├── compound
│       │   │   ├── feedback-context.tsx +
│       │   │   ├── feedback-description.tsx +
│       │   │   ├── feedback-footer.tsx +
│       │   │   ├── feedback-input.tsx +
│       │   │   ├── feedback-rating.tsx +
│       │   │   ├── feedback-title.tsx +
│       │   │   ├── feedback-widget.tsx +
│       │   │   └── index.ts +
│       │   ├── core
│       │   │   ├── submit.ts +
│       │   │   └── use-widget-machine.ts +
│       │   ├── feedback-system.ts +
│       │   ├── feedback-system.test.tsx +
│       │   ├── index.ts * +
│       │   ├── emoji-feedback.tsx +
│       │   ├── like-dislike.tsx +
│       │   ├── star-rating.tsx +
│       │   └── types.ts +
│       ├── package.json *
│       ├── tsconfig.json *
│       └── eslint.config.mjs
├── .gitignore *
├── .npmrc *
├── README.md *
├── bun.lock *
├── package.json *
├── turbo.json *
└── AGENTS.md
```

(\* denotes selected files)
(+ denotes code-map available)

## Rules

1. Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without having to explicitly ask.
2. Do not ever create custom UI components or SVG icons unless explicitly asked to. Always install new/missing components from shadcn-ui.
3. If a task requires an interactive CLI prompt, login flow, or manual browser authorization, stop before starting it, ask the user to run that step themselves, and continue once they confirm it is done.
