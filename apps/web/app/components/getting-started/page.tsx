import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  getUsageSnippet,
  namespaceConfig,
  SITE_URL,
  widgetDocs,
} from "../../_lib/widget-catalog";
import { CodeBlock } from "../_components/code-block";
import { WidgetInstallCommand } from "../_components/widget-install-command";
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/layouts/notebook/page";
import { gettingStartedSections } from "../../_lib/docs-navigation";

export const metadata: Metadata = {
  title: "Getting Started",
  description:
    "Install accessible feedback widgets into your React app and connect your own backend. No Sentimeter account required.",
  alternates: { canonical: "/components/getting-started" },
};

export default function GettingStartedPage() {
  const widget = widgetDocs[0]!;
  return (
    <DocsPage role="main" tabIndex={-1} toc={gettingStartedSections}>
      <DocsTitle>Getting Started</DocsTitle>
      <DocsDescription>
        Install a widget, try it locally, then save feedback using your own
        backend. You own the source; no Sentimeter account is required.
      </DocsDescription>
      <DocsBody className="space-y-10">
        <section aria-labelledby="prerequisites" className="space-y-3">
          <h2 id="prerequisites" className="scroll-mt-20 text-xl font-semibold">
            1. Start With a shadcn App
          </h2>
          <p className="leading-7 text-muted-foreground">
            You need React, TypeScript, Tailwind CSS, and a configured shadcn
            project. Sentimeter uses your local Button, Textarea, theme tokens,
            and utilities. Follow{" "}
            <a
              href="https://ui.shadcn.com/docs/installation"
              className="underline underline-offset-4"
            >
              shadcn installation
            </a>{" "}
            if your app is not set up yet.
          </p>
        </section>
        <section aria-labelledby="install" className="space-y-3">
          <h2 id="install" className="scroll-mt-20 text-xl font-semibold">
            2. Install a Widget
          </h2>
          <p className="leading-7 text-muted-foreground">
            This installs Emoji Feedback. Choose{" "}
            <Link href="/components" className="underline underline-offset-4">
              another widget
            </Link>{" "}
            for thumbs or stars. The command adds readable source files, not a
            hosted embed or a runtime Sentimeter package.
          </p>
          <div className="not-prose">
            <WidgetInstallCommand
              registryName={widget.registryName}
              metadata={widget.installMetadata}
            />
          </div>
          <div className="not-prose">
            <CodeBlock code={widget.usageSnippet} label="Local Example" />
          </div>
          <p className="leading-7 text-muted-foreground">
            With neither <code>submit</code> nor <code>apiKey</code>, submission
            completes locally. Nothing is sent or stored. These examples use{" "}
            <code>{"autoHide={false}"}</code> so success stays readable; the
            widget default is to hide it after 2 seconds.
          </p>
        </section>
        <section aria-labelledby="submission" className="space-y-3">
          <h2 id="submission" className="scroll-mt-20 text-xl font-semibold">
            3. Connect Your Backend
          </h2>
          <p className="leading-7 text-muted-foreground">
            Pass an asynchronous <code>submit</code> handler. It receives{" "}
            <code>location</code>, <code>widgetType</code>, <code>value</code>,
            optional <code>text</code>, and an empty <code>apiKey</code> when no
            Sentimeter key is provided. Resolve only after saving succeeds;
            throw on failure so users can retry.
          </p>
          <div className="not-prose">
            <CodeBlock
              code={getUsageSnippet(widget, undefined, "custom")}
              label="Your Backend"
            />
          </div>
          <p className="leading-7 text-muted-foreground">
            Implement <code>/api/feedback</code> in your own app; Sentimeter
            does not provide that route. Validate untrusted input, apply your
            app’s authentication and abuse protection, and persist it before
            returning a successful response. Emoji and stars use values 1–5;
            thumbs use 0 or 1.
          </p>
          <p className="leading-7 text-muted-foreground">
            Custom <code>submit</code> always takes precedence over hosted
            submission. Without a custom handler, a non-empty publishable{" "}
            <code>apiKey</code> enables optional{" "}
            <Link href="/dashboard" className="underline underline-offset-4">
              hosted analytics
            </Link>
            . Configure allowed origins in the project settings for production;
            use <code>endpoint</code> only to override hosted intake, not to
            replace a custom handler.
          </p>
          <p className="leading-7 text-muted-foreground">
            Hosted failures are <code>WidgetSubmitError</code> instances with{" "}
            <code>code</code>, optional HTTP <code>status</code>, and optional{" "}
            <code>retryAfterMs</code>. Codes are <code>missing_api_key</code>,{" "}
            <code>invalid_key</code>, <code>origin_not_allowed</code>,{" "}
            <code>rate_limited</code>, <code>invalid_value</code>,{" "}
            <code>invalid_body</code>, <code>network_error</code>, and{" "}
            <code>unknown</code>. The UI shows safe, retryable feedback;{" "}
            <code>onSubmitError</code> receives the original error for your own
            logging.
          </p>
        </section>
        <section aria-labelledby="accessibility" className="space-y-3">
          <h2 id="accessibility" className="scroll-mt-20 text-xl font-semibold">
            Keep the Widget Accessible
          </h2>
          <p className="leading-7 text-muted-foreground">
            Keep the accessible reaction names, pressed states, keyboard focus,
            disabled states, and success/error announcements when editing
            installed code. Give the widget at least 288px of container width.
            Reaction controls stay on one row with at least 44×44px targets;
            size follows the container, not the viewport.
          </p>
          <Button asChild variant="outline" className="h-11">
            <Link href="/components">Browse Widgets</Link>
          </Button>
        </section>
        <section aria-labelledby="agents" className="space-y-3">
          <h2 id="agents" className="scroll-mt-20 text-xl font-semibold">
            Using an Agent?
          </h2>
          <p className="leading-7 text-muted-foreground">
            Start with{" "}
            <a
              href={`${SITE_URL}/llms.txt`}
              className="underline underline-offset-4"
            >
              llms.txt
            </a>
            . Each widget has a Markdown document and a Copy as Markdown action.
            For namespaced installation, merge this registries entry into your
            existing <code>components.json</code>; keep the rest of your
            configuration. Full-URL install commands need no namespace setup.
          </p>
          <div className="not-prose">
            <CodeBlock
              code={namespaceConfig}
              label="components.json Registry Entry"
              lang="json"
            />
          </div>
          <div className="not-prose">
            <CodeBlock
              code="bunx shadcn@latest add @sentimeter/emoji-feedback"
              label="Namespaced Installation"
              lang="sh"
            />
          </div>
          <p className="leading-7 text-muted-foreground">
            Use{" "}
            <a
              href="https://ui.shadcn.com/docs/mcp"
              className="underline underline-offset-4"
            >
              shadcn’s existing MCP integration
            </a>{" "}
            with this namespace. No custom Sentimeter MCP server is required.
          </p>
        </section>
      </DocsBody>
    </DocsPage>
  );
}
