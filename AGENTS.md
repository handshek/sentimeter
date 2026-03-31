# AGENTS.md — Sentimeter

## What is this project?

Sentimeter is a shadcn-first feedback collection system. Developers install open-code React components from the shadcn registry into their own shadcn projects, the components adapt to the host app's existing UI structure, their users submit emoji/star/thumbs reactions, and the developer sees real-time analytics on a hosted dashboard.

It consists of:

- A Next.js 15 dashboard (apps/web)
- A shadcn registry app (apps/registry) — Cloudflare Worker serving registry JSON so developers can `shadcn add "https://registry.handshek.workers.dev/r/emoji-feedback.json"` and have the component fit naturally into their existing shadcn project
- An embeddable widgets package (packages/widgets)
- AI-generated test cases using TestSprite MCP (testsprite_tests)

## Tech stack

- **Monorepo:** Turborepo, Bun
- **Frontend:** Next.js 16 (App Router), TypeScript, TailwindCSS v4, shadcn/ui, tabler-react icons
- **Backend & DB:** Convex (realtime database, server functions, HTTP actions)
- **Auth:** Clerk (syncs to Convex)
- **Quality Assurance:** TestSprite MCP for AI-driven testing

## Running locally

- `bun run dev` — Starts the dashboard and widgets in dev mode
- `bun run build` — Builds all packages and apps
- `bun run registry:build` — Builds the shadcn registry (outputs to apps/registry/public/r/\*\*); run from repo root or from apps/registry
- `bun run lint` — Lints the entire monorepo
- `bun run format` — Formats the codebase with Prettier
- `bun run check-types` — Runs type checking across the repo

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
│   │   ├── registry
│   │   │   └── sentimeter
│   │   │       ├── emoji-feedback.tsx +
│   │   │       ├── feedback-system.tsx +
│   │   │       ├── like-dislike.tsx +
│   │   │       └── star-rating.tsx +
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
│       │   │   ├── ui.ts +
│       │   │   └── use-widget-machine.ts +
│       │   ├── index.ts * +
│       │   ├── emoji-feedback.tsx +
│       │   ├── like-dislike.tsx +
│       │   ├── star-rating.tsx +
│       │   └── types.ts +
│       ├── package.json *
│       ├── tsconfig.json *
│       └── eslint.config.mjs
├── testsprite_tests
│   ├── README.md *
│   ├── PRD.md
│   ├── TC001_Access_dashboard_after_signing_in_and_see_main_dashboard_UI_elements.py +
│   ├── TC001_Landing_page_loads_and_shows_primary_Sign_In_call_to_action.py +
│   ├── TC002_Create_a_new_project_successfully_from_the_dashboard_modal.py +
│   ├── TC002_Landing_page_Sign_In_CTA_navigates_to_Clerk_sign_in_page.py +
│   ├── TC003_Landing_page_loads_and_shows_primary_Sign_Up_call_to_action.py +
│   ├── TC003_Project_creation_validation_missing_project_name_shows_error_and_does_not_create_project.py +
│   ├── TC004_Dashboard_shows_Create_Project_entry_point_for_signed_in_users.py +
│   ├── TC004_Landing_page_Sign_Up_CTA_navigates_to_Clerk_sign_up_page.py +
│   ├── TC005_Direct_navigation_to_sign_in_renders_Clerk_sign_in_widget_for_signed_out_user.py +
│   ├── TC005_Projects_list_area_is_visible_on_the_dashboard_after_sign_in.py +
│   ├── TC006_Direct_navigation_to_sign_up_renders_Clerk_sign_up_widget_for_signed_out_user.py +
│   ├── open_dashboard.mjs
│   ├── run_mcp.mjs
│   ├── standard_prd.json
│   └── testsprite_frontend_test_plan.json
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

1. Ensure TestSprite MCP is used to generate test cases wherever _important_.
2. Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without having to explicitly ask.
3. Do not ever create custom UI components or SVG icons unless explicitly asked to. Always install new/missing components from shadcn-ui.
4. If a task requires an interactive CLI prompt, login flow, or manual browser authorization, stop before starting it, ask the user to run that step themselves, and continue once they confirm it is done.
