# AGENTS.md — Sentimeter

## What is this project?

Sentimeter is a developer-first feedback collection system. Developers install open-code React components (via shadcn registry) into their apps, their users submit emoji/star/thumbs reactions, and the developer sees real-time analytics on a hosted dashboard.

It consists of:

- A Next.js 15 dashboard (apps/web)
- An embeddable widgets package (packages/widgets)
- AI-generated test cases using TestSprite MCP (testsprite_tests)

## Tech stack

- **Monorepo:** Turborepo, Bun
- **Frontend:** Next.js 15 (App Router), TypeScript, TailwindCSS v4, shadcn/ui, tabler-react icons
- **Backend & DB:** Convex (realtime database, server functions, HTTP actions)
- **Auth:** Clerk (syncs to Convex)
- **Quality Assurance:** TestSprite MCP for AI-driven testing

## Running locally

- `bun run dev` — Starts the dashboard and widgets in dev mode
- `bun run build` — Builds all packages and apps
- `bun run lint` — Lints the entire monorepo
- `bun run format` — Formats the codebase with Prettier
- `bun run check-types` — Runs type checking across the repo

**Do NOT run:** `bun run dev` (assume already running)

Only use `bun` or `bunx` for installing dependencies

## Monorepo structure

```
/Users/abhi/dev/sentimeter
├── apps
│   └── web
│       ├── app
│       │   ├── fonts
│       │   │   ├── GeistMonoVF.woff *
│       │   │   └── GeistVF.woff *
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
│       ├── .gitignore *
│       ├── README.md *
│       ├── components.json *
│       ├── eslint.config.js * +
│       ├── next.config.js * +
│       ├── package.json *
│       ├── postcss.config.mjs *
│       └── tsconfig.json *
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
│   │   │   │   └── button.tsx * +
│   │   │   ├── lib
│   │   │   │   └── utils.ts * +
│   │   │   └── styles
│   │   │       └── globals.css *
│   │   ├── components.json *
│   │   ├── package.json *
│   │   └── tsconfig.json *
│   └── widgets
│       ├── src
│       │   └── index.ts * +
│       ├── package.json *
│       └── tsconfig.json *
├── testsprite_tests
│   └── README.md *
├── .gitignore *
├── .npmrc *
├── README.md *
├── bun.lock *
├── package.json *
├── test-output.css *
└── turbo.json *
```

(\* denotes selected files)
(+ denotes code-map available)

## Rules

1. Ensure TestSprite MCP is used to generate test cases wherever _important_ without having to explicitly ask.
2. Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without having to explicitly ask.
