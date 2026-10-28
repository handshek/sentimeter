"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Inbox,
  RotateCcw,
} from "lucide-react";
import { EmojiFeedback, LikeDislike } from "@workspace/widgets";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Progress } from "@workspace/ui/components/progress";
import { Switch } from "@workspace/ui/components/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { CodeBlock } from "../../components/_components/code-block";

function MarketingPattern() {
  return (
    <div className="space-y-6">
      <div className="ds-panel">
        <div className="ds-caption border-b border-border px-6 py-3 text-muted-foreground">
          Marketing / a focused introduction
        </div>
        <div className="grid gap-8 px-0 py-6 sm:p-8 xl:grid-cols-2 xl:items-center">
          <div className="px-5 sm:px-0">
            <p className="ds-eyebrow mb-4 text-muted-foreground">
              Built for the moments that matter
            </p>
            <h3 className="ds-page-title">
              A better question.
              <br />A closer connection.
            </h3>
            <p className="ds-body mt-5 text-muted-foreground">
              Make it easy for people to tell you how they feel. Start with
              thoughtful feedback UI, then make it your own.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/components">
                  Explore widgets{" "}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/components/getting-started">Read the docs</Link>
              </Button>
            </div>
            <p className="ds-caption mt-4 flex items-center gap-1.5 text-muted-foreground">
              <Check aria-hidden="true" className="size-3.5" />
              Open source. No account required.
            </p>
          </div>
          <div className="ds-inset flex min-h-64 min-w-0 items-center justify-center px-3 py-8 sm:px-6">
            <EmojiFeedback
              title="How does this feel?"
              description="Try the real component."
              autoHide={false}
            />
          </div>
        </div>
      </div>
      <dl className="grid gap-5 sm:grid-cols-3">
        <div>
          <dt className="ds-heading">Lead with a promise</dt>
          <dd className="ds-body-sm mt-1.5 text-muted-foreground">
            One display statement, a short explanation, and a clear next step.
          </dd>
        </div>
        <div>
          <dt className="ds-heading">Show the product</dt>
          <dd className="ds-body-sm mt-1.5 text-muted-foreground">
            A real specimen gives the typography something concrete to support.
          </dd>
        </div>
        <div>
          <dt className="ds-heading">Use generous space</dt>
          <dd className="ds-body-sm mt-1.5 text-muted-foreground">
            Let the layout breathe. Stack the columns before either becomes
            cramped.
          </dd>
        </div>
      </dl>
    </div>
  );
}

function DocumentationPattern() {
  const [example, setExample] = useState(0);
  return (
    <div className="space-y-6">
      <div className="ds-panel py-5 sm:p-8">
        <p className="ds-eyebrow mb-5 px-5 text-muted-foreground sm:px-0">
          Documentation / getting started
        </p>
        <article className="ds-reading space-y-6">
          <header className="space-y-3 px-5 sm:px-0">
            <h3 className="ds-page-title">Make feedback part of your app.</h3>
            <p className="ds-lead text-muted-foreground">
              Install the source, add a component, and connect the destination
              you already use.
            </p>
          </header>
          <div className="space-y-3 px-5 sm:px-0">
            <h4 className="ds-title">Start with a configured shadcn project</h4>
            <p className="ds-body text-muted-foreground">
              The registry uses your local components and semantic theme. The
              refined widget inherits the colors, radius, and typography you
              have already chosen.
            </p>
            <ul className="ds-body list-disc space-y-2 pl-5 text-muted-foreground marker:text-primary">
              <li>Choose the reaction type that fits your question.</li>
              <li>Keep the label short and specific to the moment.</li>
              <li>Add optional text when a rating needs more context.</li>
            </ul>
          </div>
          <div className="px-5 sm:px-0">
            <CodeBlock
              label="feedback.tsx"
              code={
                '<EmojiFeedback\n  title="How was getting started?"\n  autoHide={false}\n  submit={saveFeedback}\n/>'
              }
            />
          </div>
          <p className="ds-body-sm px-5 text-muted-foreground sm:px-0">
            Define <code className="ds-code">saveFeedback</code> in your
            application to validate and persist the payload.{" "}
            <Link
              href="/components/getting-started#submission"
              className="rounded-sm text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
            >
              Read the complete integration guide
            </Link>
            .
          </p>
          <div className="border-t border-border pt-6">
            <LikeDislike
              key={example}
              title="Was this page useful?"
              layout="inline"
              autoHide={false}
            />
            <Button
              variant="ghost"
              className="mt-3 ml-5 text-muted-foreground sm:ml-0"
              onClick={() => setExample((value) => value + 1)}
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              Reset local example
            </Button>
          </div>
        </article>
      </div>
      <p className="ds-body-sm text-muted-foreground">
        Reading measure: 65 characters. Body: 16 px with 1.65 line height.
        Headings create the outline; code and feedback support it. This example
        does not store submissions.
      </p>
    </div>
  );
}

const sampleResponses = [
  {
    source: "Getting started",
    type: "Emoji",
    rating: "5 / 5",
    comment: "The setup was easy to follow.",
  },
  {
    source: "Support",
    type: "Stars",
    rating: "4 / 5",
    comment: "Helpful answer, thank you.",
  },
  {
    source: "API reference",
    type: "Thumbs",
    rating: "Not helpful",
    comment: "An example response would help.",
  },
];

function AnalyticsPattern() {
  const [state, setState] = useState<"ready" | "empty" | "error">("ready");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="ds-body-sm text-muted-foreground">
          Change the local dataset to inspect recovery and first-use states.
        </p>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Analytics example states"
        >
          <Button
            variant={state === "ready" ? "secondary" : "outline"}
            aria-pressed={state === "ready"}
            onClick={() => setState("ready")}
          >
            Sample data
          </Button>
          <Button
            variant={state === "empty" ? "secondary" : "outline"}
            aria-pressed={state === "empty"}
            onClick={() => setState("empty")}
          >
            Empty
          </Button>
          <Button
            variant={state === "error" ? "secondary" : "outline"}
            aria-pressed={state === "error"}
            onClick={() => setState("error")}
          >
            Error
          </Button>
        </div>
      </div>
      <div className="ds-panel overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
          <div>
            <p className="ds-eyebrow mb-2 text-muted-foreground">
              Product / project overview
            </p>
            <h3 className="ds-title">Workspace feedback</h3>
            <p className="ds-caption mt-1 text-muted-foreground">
              Understand the experience, then read the context.
            </p>
          </div>
          <Badge variant="outline" className="h-6">
            Sample data
          </Badge>
        </div>
        {state === "ready" ? (
          <>
            <dl className="grid divide-y divide-border border-b border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="p-5 sm:p-6">
                <dt className="ds-label text-muted-foreground">Responses</dt>
                <dd className="mt-3">
                  <span className="ds-page-title tabular-nums">3</span>
                  <p className="ds-caption mt-2 text-muted-foreground">
                    Across three touchpoints
                  </p>
                </dd>
              </div>
              <div className="p-5 sm:p-6">
                <dt className="ds-label text-muted-foreground">Positive</dt>
                <dd className="mt-3">
                  <span className="ds-page-title tabular-nums">
                    67<span className="ds-title">%</span>
                  </span>
                  <Progress
                    value={67}
                    aria-label="Positive sample feedback: 67 percent"
                    className="mt-4 max-w-32"
                  />
                </dd>
              </div>
              <div className="p-5 sm:p-6">
                <dt className="ds-label text-muted-foreground">
                  With a comment
                </dt>
                <dd className="mt-3">
                  <span className="ds-page-title tabular-nums">
                    3{" "}
                    <span className="ds-label text-muted-foreground">of 3</span>
                  </span>
                  <p className="ds-caption mt-2 text-muted-foreground">
                    A rating with useful context
                  </p>
                </dd>
              </div>
            </dl>
            <div className="p-5 sm:p-6">
              <h4 className="ds-label mb-4">Recent responses</h4>
              <Table
                tabIndex={0}
                aria-label="Sample feedback responses"
                className="focus-visible:outline-2 focus-visible:outline-ring"
              >
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleResponses.map((response) => (
                    <TableRow key={response.source}>
                      <TableCell className="py-4">
                        <span className="ds-label block">
                          {response.source}
                        </span>
                        <span className="ds-caption text-muted-foreground">
                          {response.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{response.rating}</Badge>
                      </TableCell>
                      <TableCell className="min-w-44 whitespace-normal leading-6 text-muted-foreground">
                        {response.comment}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 py-10 text-center">
            {state === "error" ? (
              <AlertCircle
                aria-hidden="true"
                className="mb-5 size-6 text-destructive"
              />
            ) : (
              <Inbox
                aria-hidden="true"
                className="mb-5 size-6 text-muted-foreground"
              />
            )}
            <div role={state === "error" ? "alert" : "status"}>
              <h4 className="ds-title">
                {state === "error"
                  ? "We couldn’t load the responses."
                  : "Your first conversation starts here."}
              </h4>
              <p className="ds-body mt-3 max-w-md text-muted-foreground">
                {state === "error"
                  ? "Your project is still here. Try loading the sample again."
                  : "Once someone shares feedback, their rating and comment will appear together in this view."}
              </p>
            </div>
            <Button className="mt-6" onClick={() => setState("ready")}>
              {state === "error" ? "Try again" : "Load sample responses"}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        )}
      </div>
      <p className="ds-body-sm text-muted-foreground">
        Product surfaces trade display scale for scanability: aligned metrics,
        tabular numbers, compact labels, and one readable table. Empty and error
        states replace the affected region, preserving the surrounding context.
      </p>
    </div>
  );
}

function SettingsPattern() {
  const id = useId();
  const [name, setName] = useState("Workspace");
  const [digest, setDigest] = useState(true);
  const [saved, setSaved] = useState({ name: "Workspace", digest: true });
  const [status, setStatus] = useState<"idle" | "error" | "saved">("idle");
  const dirty = name !== saved.name || digest !== saved.digest;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setStatus("error");
      document.getElementById(`${id}-name`)?.focus();
      return;
    }
    const nextName = name.trim();
    setName(nextName);
    setSaved({ name: nextName, digest });
    setStatus("saved");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} noValidate className="ds-panel overflow-hidden">
        <header className="border-b border-border p-5 sm:p-6">
          <p className="ds-eyebrow mb-2 text-muted-foreground">
            Product / project settings
          </p>
          <h3 className="ds-title">Make this space yours.</h3>
          <p className="ds-body mt-2 text-muted-foreground">
            A quiet form with clear labels and a deliberate save action.
          </p>
        </header>
        <div className="space-y-8 p-5 sm:p-6">
          <div className="max-w-md space-y-2">
            <Label htmlFor={`${id}-name`}>Project name</Label>
            <Input
              id={`${id}-name`}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setStatus("idle");
              }}
              aria-invalid={status === "error"}
              aria-describedby={`${id}-name-help`}
            />
            <p
              id={`${id}-name-help`}
              className={`ds-caption ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}
            >
              {status === "error"
                ? "Use at least two characters for the project name."
                : "Use a name your team will recognize."}
            </p>
          </div>
          <div className="flex max-w-xl items-center justify-between gap-6 border-t border-border pt-6">
            <div>
              <Label htmlFor={`${id}-digest`}>Weekly feedback digest</Label>
              <p
                id={`${id}-digest-help`}
                className="ds-body-sm mt-1.5 text-muted-foreground"
              >
                An example preference. This demo sends no email.
              </p>
            </div>
            <Switch
              id={`${id}-digest`}
              checked={digest}
              onCheckedChange={(checked) => {
                setDigest(checked);
                setStatus("idle");
              }}
              aria-describedby={`${id}-digest-help`}
            />
          </div>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-muted/25 p-5 sm:px-6">
          <p
            className="ds-caption flex min-h-6 items-center gap-1.5 text-muted-foreground"
            role="status"
          >
            {status === "saved" ? (
              <>
                <CheckCircle2
                  aria-hidden="true"
                  className="size-4 text-primary"
                />
                Saved in this preview.
              </>
            ) : dirty ? (
              "You have unsaved changes."
            ) : (
              "Changes stay in this preview."
            )}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!dirty && status !== "error"}
              onClick={() => {
                setName(saved.name);
                setDigest(saved.digest);
                setStatus("idle");
              }}
            >
              Discard
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </footer>
      </form>
      <p className="ds-body-sm text-muted-foreground">
        Try clearing the name and saving to inspect validation, then correct it
        to see confirmation. The model is local and resets on remount; no
        account or server settings are changed.
      </p>
    </div>
  );
}

export function PatternSpecimens() {
  return (
    <Tabs defaultValue="marketing" className="gap-6">
      {/* One row that scrolls when narrow; the vertical padding keeps the
          triggers' 44 px hit areas inside the scroll container. */}
      <div className="-my-2 max-w-full overflow-x-auto py-2">
        <TabsList aria-label="Composition scenarios">
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="marketing">
        <MarketingPattern />
      </TabsContent>
      <TabsContent value="documentation">
        <DocumentationPattern />
      </TabsContent>
      <TabsContent value="analytics">
        <AnalyticsPattern />
      </TabsContent>
      <TabsContent value="settings">
        <SettingsPattern />
      </TabsContent>
    </Tabs>
  );
}
