import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  getUsageSnippet,
  namespaceConfig,
  SITE_URL,
  widgetDocs,
} from "@/lib/widget-catalog";
import { CodeBlock } from "@/components/docs/code-block";
import { WidgetInstallCommand } from "@/components/docs/widget-install-command";
import { DocsPage } from "fumadocs-ui/layouts/notebook/page";
import { gettingStartedSections } from "@/lib/docs-navigation";

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
      <header className="docs-header">
        <p className="ds-eyebrow text-muted-foreground">
          Installation & integration
        </p>
        <h1 className="ds-page-title">Your first feedback widget.</h1>
        <p className="ds-lead text-muted-foreground">
          Install a widget, try it locally, then save feedback using your own
          backend. You own the source; no Sentimeter account is required.
        </p>
      </header>
      <div className="docs-content">
        <section aria-labelledby="prerequisites" className="docs-section">
          <h2 id="prerequisites" className="ds-section-title">
            1. Start With a shadcn App
          </h2>
          <p className="ds-body text-muted-foreground">
            You need React, TypeScript, Tailwind CSS, and a configured shadcn
            project. Sentimeter uses your local Button, Textarea, Label, theme
            tokens, and utilities. Follow{" "}
            <a
              href="https://ui.shadcn.com/docs/installation"
              className="docs-link"
            >
              shadcn installation
            </a>{" "}
            if your app is not set up yet.
          </p>
        </section>
        <section aria-labelledby="install" className="docs-section">
          <h2 id="install" className="ds-section-title">
            2. Install a Widget
          </h2>
          <p className="ds-body text-muted-foreground">
            This installs Emoji Feedback. Choose{" "}
            <Link href="/components" className="docs-link">
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
          <p className="ds-body text-muted-foreground">
            Without a <code>submit</code> handler, submission completes locally.
            Nothing is sent or stored. These examples use{" "}
            <code>{"autoHide={false}"}</code> so success stays readable; the
            widget default is to hide it after 2 seconds.
          </p>
          <p className="ds-body text-muted-foreground">
            The widget follows your app’s theme. Adjust scoped tokens through
            the{" "}
            <Link href="/design-system/widgets" className="docs-link">
              design system
            </Link>
            . Each installed widget includes the same editable recipes.
          </p>
        </section>
        <section aria-labelledby="submission" className="docs-section">
          <h2 id="submission" className="ds-section-title">
            3. Connect Your Backend
          </h2>
          <p className="ds-body text-muted-foreground">
            Pass an asynchronous <code>submit</code> handler. It receives{" "}
            <code>location</code>, <code>widgetType</code>, <code>value</code>,
            and optional <code>text</code>. The <code>location</code> prop
            defaults to <code>{'"/"'}</code>; set it to identify the feedback
            source. Resolve only after saving succeeds; throw on failure so
            users can retry.
          </p>
          <div className="not-prose">
            <CodeBlock
              code={getUsageSnippet(widget, undefined, "custom")}
              label="Your Backend"
            />
          </div>
          <p className="ds-body text-muted-foreground">
            Implement <code>/api/feedback</code> in your own app; Sentimeter
            does not provide that route. Validate untrusted input, apply your
            app’s authentication and abuse protection, and persist it before
            returning a successful response. Emoji and stars use values 1–5;
            thumbs use 0 or 1.
          </p>
          <p className="ds-body text-muted-foreground">
            Your handler can throw <code>WidgetSubmitError</code> with a
            user-facing message, optional <code>status</code>, and optional{" "}
            <code>retryAfterMs</code>. Other errors show a safe retry message.{" "}
            <code>onSubmitError</code> receives the original error for your own
            logging.
          </p>
        </section>
        <section aria-labelledby="accessibility" className="docs-section">
          <h2 id="accessibility" className="ds-section-title">
            Keep the Widget Accessible
          </h2>
          <p className="ds-body text-muted-foreground">
            Keep the accessible reaction names, pressed states, keyboard focus,
            disabled states, and success/error announcements when editing
            installed code. Give the widget at least 288px of container width.
            Rating tiles stay on one row at 44 px; the inline layout uses 32 px
            choices with a 44 px tall hit area. Size follows the container, not
            the viewport.
          </p>
          <Button asChild variant="outline">
            <Link href="/components">Browse Widgets</Link>
          </Button>
        </section>
        <section aria-labelledby="agents" className="docs-section">
          <h2 id="agents" className="ds-section-title">
            Using an Agent?
          </h2>
          <p className="ds-body text-muted-foreground">
            Start with{" "}
            <a href={`${SITE_URL}/llms.txt`} className="docs-link">
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
          <p className="ds-body text-muted-foreground">
            Use{" "}
            <a href="https://ui.shadcn.com/docs/mcp" className="docs-link">
              shadcn’s existing MCP integration
            </a>{" "}
            with this namespace. No custom Sentimeter MCP server is required.
          </p>
        </section>
      </div>
    </DocsPage>
  );
}
