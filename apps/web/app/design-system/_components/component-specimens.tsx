"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Bookmark,
  Check,
  Inbox,
  Loader2,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@workspace/ui/components/table";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@workspace/ui/components/accordion";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@workspace/ui/components/popover";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@workspace/ui/components/sheet";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@workspace/ui/components/alert-dialog";

export function ComponentSpecimens() {
  return (
    <div className="space-y-16">
      <p className="ds-caption ds-inset p-4 text-muted-foreground">
        Interactive examples. Changes stay in this page and reset on refresh; no
        data is sent or saved to an account.
      </p>
      <ActionSpecimens />
      <FormSpecimen />
      <NavigationSpecimens />
      <DataSpecimen />
      <OverlaySpecimens />
    </div>
  );
}

function ActionSpecimens() {
  const [phase, setPhase] = useState<"idle" | "pending" | "saved">("idle");
  const [bookmarked, setBookmarked] = useState(false);
  useEffect(() => {
    if (phase !== "pending") return;
    const timer = setTimeout(() => setPhase("saved"), 900);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <section
      id="actions"
      aria-labelledby="actions-title"
      className="space-y-6 scroll-mt-24"
    >
      <div className="space-y-2">
        <p className="ds-eyebrow text-muted-foreground">01 / Actions</p>
        <h2 id="actions-title" className="ds-section-title">
          A clear next step.
        </h2>
        <p className="ds-body max-w-prose text-muted-foreground">
          One primary action per group. Give quieter actions less visual weight
          and keep their labels specific.
        </p>
      </div>
      <div className="ds-panel space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            disabled={phase !== "idle"}
            onClick={() => setPhase("pending")}
          >
            {phase === "pending" ? (
              <Loader2
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
            ) : phase === "saved" ? (
              <Check aria-hidden="true" className="size-4" />
            ) : null}
            {phase === "pending"
              ? "Saving draft…"
              : phase === "saved"
                ? "Draft saved"
                : "Save draft"}
          </Button>
          <Button
            variant="outline"
            disabled={phase === "pending"}
            onClick={() => setPhase("idle")}
          >
            Restore draft
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/components">Browse widgets</Link>
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark example"}
            aria-pressed={bookmarked}
            onClick={() => setBookmarked((value) => !value)}
          >
            <Bookmark
              aria-hidden="true"
              className={bookmarked ? "size-4 fill-current" : "size-4"}
            />
          </Button>
          <Button disabled>No changes</Button>
        </div>
        <p role="status" className="ds-caption min-h-5 text-muted-foreground">
          {phase === "pending"
            ? "Simulating a save. The action stays in place."
            : phase === "saved"
              ? "Draft saved for this example. Restore it to try again."
              : "Default, outline, ghost, icon toggle, and disabled states."}
        </p>
        <div className="flex flex-wrap items-center gap-2 border-t pt-5">
          <Badge>Published</Badge>
          <Badge variant="secondary">Draft</Badge>
          <Badge variant="outline">Local example</Badge>
          <Badge variant="destructive">Action needed</Badge>
        </div>
      </div>
      <p className="ds-caption text-muted-foreground">
        Button · Badge — shadcn’s 36 px controls, each with an invisible hit
        area of at least 44 px. Pending and disabled controls keep their context
        readable.
      </p>
    </section>
  );
}

function FormSpecimen() {
  const id = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("Atlas workspace");
  const [email, setEmail] = useState("team@example.com");
  const [notes, setNotes] = useState(
    "Collect feedback after a project is shared.",
  );
  const [digest, setDigest] = useState(true);
  const [frequency, setFrequency] = useState("weekly");
  const [phase, setPhase] = useState<"idle" | "pending" | "saved">("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  useEffect(() => {
    if (phase !== "pending") return;
    const timer = setTimeout(() => setPhase("saved"), 900);
    return () => clearTimeout(timer);
  }, [phase]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase === "pending") return;
    const nextErrors = {
      ...(name.trim().length < 2
        ? { name: "Use at least two characters for the project name." }
        : {}),
      ...(digest && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? { email: "Enter an email address for the feedback digest." }
        : {}),
    };
    setErrors(nextErrors);
    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }
    setPhase("pending");
  }
  function edited() {
    setPhase("idle");
  }
  const pending = phase === "pending";

  return (
    <section
      id="forms"
      aria-labelledby="forms-title"
      className="space-y-6 scroll-mt-24"
    >
      <div className="space-y-2">
        <p className="ds-eyebrow text-muted-foreground">02 / Forms</p>
        <h2 id="forms-title" className="ds-section-title">
          Ask with context.
        </h2>
        <p className="ds-body max-w-prose text-muted-foreground">
          Persistent labels, nearby help, and errors that explain how to
          recover. Try clearing the project name before saving.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)]">
        <form
          noValidate
          onSubmit={submit}
          className="ds-panel space-y-6 p-6"
          aria-label="Example project preferences"
        >
          <div className="space-y-2">
            <h3 className="ds-title">Project preferences</h3>
            <p className="ds-caption text-muted-foreground">
              A local form example with validation and save feedback.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Project name</Label>
            <Input
              ref={nameRef}
              id={`${id}-name`}
              name="project-name"
              value={name}
              disabled={pending}
              aria-invalid={!!errors.name}
              aria-describedby={`${id}-name-help`}
              onChange={(event) => {
                setName(event.target.value);
                setErrors((current) => ({ ...current, name: undefined }));
                edited();
              }}
            />
            <p
              id={`${id}-name-help`}
              className={
                errors.name
                  ? "ds-caption text-destructive"
                  : "ds-caption text-muted-foreground"
              }
              role={errors.name ? "alert" : undefined}
            >
              {errors.name ?? "Shown to your team. You can change this later."}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-notes`}>
              Collection notes{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id={`${id}-notes`}
              value={notes}
              disabled={pending}
              className="min-h-24"
              onChange={(event) => {
                setNotes(event.target.value);
                edited();
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-6 border-y py-5">
            <div className="space-y-2">
              <Label htmlFor={`${id}-digest`}>Email digest</Label>
              <p
                id={`${id}-digest-help`}
                className="ds-caption text-muted-foreground"
              >
                A summary of new feedback.
              </p>
            </div>
            <Switch
              id={`${id}-digest`}
              aria-describedby={`${id}-digest-help`}
              checked={digest}
              disabled={pending}
              onCheckedChange={(checked) => {
                setDigest(checked);
                setErrors((current) => ({ ...current, email: undefined }));
                edited();
              }}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${id}-email`}>Recipient email</Label>
              <Input
                ref={emailRef}
                id={`${id}-email`}
                name="email"
                type="email"
                value={email}
                disabled={pending || !digest}
                aria-invalid={!!errors.email}
                aria-describedby={
                  errors.email ? `${id}-email-error` : undefined
                }
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((current) => ({ ...current, email: undefined }));
                  edited();
                }}
              />
              {errors.email ? (
                <p
                  id={`${id}-email-error`}
                  role="alert"
                  className="ds-caption text-destructive"
                >
                  {errors.email}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-frequency`}>Frequency</Label>
              <Select
                value={frequency}
                disabled={pending || !digest}
                onValueChange={(value) => {
                  setFrequency(value);
                  edited();
                }}
              >
                <SelectTrigger id={`${id}-frequency`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-workspace`}>Workspace ID</Label>
            <Input
              id={`${id}-workspace`}
              value="workspace_atlas_demo"
              disabled
              className="ds-code"
            />
            <p className="ds-caption text-muted-foreground">
              System-generated identifiers are not editable.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t pt-5">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2
                  aria-hidden="true"
                  className="size-4 animate-spin motion-reduce:animate-none"
                />
              ) : phase === "saved" ? (
                <Check aria-hidden="true" className="size-4" />
              ) : null}
              {pending ? "Saving…" : "Save preferences"}
            </Button>
            <p role="status" className="ds-caption text-muted-foreground">
              {pending
                ? "Saving this example…"
                : phase === "saved"
                  ? "Preferences saved in this example."
                  : "No account or network request."}
            </p>
          </div>
        </form>
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="ds-title">Current configuration</CardTitle>
              <CardDescription>A live view of the form values.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-5">
                <div>
                  <dt className="ds-caption text-muted-foreground">Project</dt>
                  <dd className="ds-body break-words">
                    {name.trim() || "Untitled project"}
                  </dd>
                </div>
                <div>
                  <dt className="ds-caption text-muted-foreground">Digest</dt>
                  <dd className="ds-body">
                    {digest
                      ? `${frequency.charAt(0).toUpperCase()}${frequency.slice(1)}`
                      : "Off"}
                  </dd>
                </div>
                <div>
                  <dt className="ds-caption text-muted-foreground">Notes</dt>
                  <dd className="ds-body break-words">
                    {notes.trim() || "No notes added."}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <div className="ds-inset space-y-3 p-5">
            <p className="ds-label">Try the states</p>
            <ol className="ds-body list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>Clear the name, then save to reveal an error.</li>
              <li>Turn the digest off to see dependent controls disabled.</li>
              <li>Save valid values to see pending and success feedback.</li>
            </ol>
          </div>
        </aside>
      </div>
      <p className="ds-caption text-muted-foreground">
        Input · Textarea · Label · Switch · Select · Card — helper text precedes
        errors; entered values survive validation.
      </p>
    </section>
  );
}

function NavigationSpecimens() {
  return (
    <section
      id="navigation"
      aria-labelledby="navigation-title"
      className="space-y-6 scroll-mt-24"
    >
      <div className="space-y-2">
        <p className="ds-eyebrow text-muted-foreground">03 / Navigation</p>
        <h2 id="navigation-title" className="ds-section-title">
          Reveal the right level of detail.
        </h2>
        <p className="ds-body max-w-prose text-muted-foreground">
          Tabs switch between related views. Accordions keep supporting answers
          close without hiding the primary task.
        </p>
      </div>
      <div className="ds-panel p-6">
        <Tabs defaultValue="overview">
          <TabsList aria-label="Widget information" className="max-w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="installation">Installation</TabsTrigger>
            <TabsTrigger value="ownership">Source</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-3 pt-5">
            <h3 className="ds-title">A small moment for feedback.</h3>
            <p className="ds-body max-w-prose text-muted-foreground">
              Use emoji, thumbs, or stars to ask one focused question. Keep an
              optional comment field for people who have more to say.
            </p>
            <Button asChild variant="outline">
              <Link href="/components">Try the widgets</Link>
            </Button>
          </TabsContent>
          <TabsContent value="installation" className="space-y-3 pt-5">
            <h3 className="ds-title">Install into your existing app.</h3>
            <p className="ds-body max-w-prose text-muted-foreground">
              The registry adds React source and reuses your local shadcn
              components. Your theme stays in charge.
            </p>
            <Button asChild variant="outline">
              <Link href="/components/getting-started">
                Read installation guide
              </Link>
            </Button>
          </TabsContent>
          <TabsContent value="ownership" className="space-y-3 pt-5">
            <h3 className="ds-title">Your components. Your backend.</h3>
            <p className="ds-body max-w-prose text-muted-foreground">
              Edit the source in your project and connect your own submit
              handler. Without a handler, feedback completes locally.
            </p>
            <Button asChild variant="outline">
              <Link href="/components/getting-started#submission">
                Connect your backend
              </Link>
            </Button>
          </TabsContent>
        </Tabs>
        <Accordion type="single" collapsible className="mt-8 border-t">
          <AccordionItem value="account">
            <AccordionTrigger className="min-h-11">
              Do I need a Sentimeter account?
            </AccordionTrigger>
            <AccordionContent>
              <p className="ds-body max-w-prose text-muted-foreground">
                No. Browsing, installing, and using the open-source widgets with
                your own backend require no account.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="theme">
            <AccordionTrigger className="min-h-11">
              Will it match my application?
            </AccordionTrigger>
            <AccordionContent>
              <p className="ds-body max-w-prose text-muted-foreground">
                The widget inherits your app’s semantic colors, font, and
                radius.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <p className="ds-caption text-muted-foreground">
        Tabs · Accordion — preserve arrow-key navigation and visible focus. Use
        links when moving to another page.
      </p>
    </section>
  );
}

const sampleFeedback = [
  {
    id: "01",
    message: "Sharing a project felt straightforward.",
    location: "Project sharing",
    rating: "5 / 5",
    reviewed: false,
  },
  {
    id: "02",
    message: "I could not find the export option.",
    location: "Reports",
    rating: "2 / 5",
    reviewed: false,
  },
  {
    id: "03",
    message: "The new onboarding saved me time.",
    location: "Onboarding",
    rating: "4 / 5",
    reviewed: true,
  },
];

function DataSpecimen() {
  const [rows, setRows] = useState(sampleFeedback);
  const [filter, setFilter] = useState("all");
  const [compact, setCompact] = useState(false);
  const [notice, setNotice] = useState("");
  const rowActions = useRef<Record<string, HTMLButtonElement | null>>({});
  const tableRegion = useRef<HTMLDivElement>(null);
  const emptyAction = useRef<HTMLButtonElement>(null);
  const allTab = useRef<HTMLButtonElement>(null);
  const focusAfterReview = useRef<{ rowId?: string } | null>(null);
  const id = useId();
  useEffect(() => {
    const target = focusAfterReview.current;
    if (!target) return;
    const control =
      (target.rowId ? rowActions.current[target.rowId] : null) ??
      emptyAction.current ??
      tableRegion.current;
    control?.focus();
    focusAfterReview.current = null;
  }, [rows]);
  const reviewed = rows.filter((row) => row.reviewed).length;
  const visible = rows.filter(
    (row) => filter === "all" || row.reviewed === (filter === "reviewed"),
  );
  const progress = Math.round((reviewed / rows.length) * 100);
  return (
    <section
      id="data"
      aria-labelledby="data-title"
      className="space-y-6 scroll-mt-24"
    >
      <div className="space-y-2">
        <p className="ds-eyebrow text-muted-foreground">04 / Data</p>
        <h2 id="data-title" className="ds-section-title">
          Make a busy view easy to read.
        </h2>
        <p className="ds-body max-w-prose text-muted-foreground">
          Use alignment and grouping before adding borders. Status always has a
          text label; progress includes the underlying count.
        </p>
      </div>
      <Tabs value={filter} onValueChange={setFilter}>
        <div className="ds-panel min-w-0 overflow-hidden">
          <div className="space-y-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="ds-title">Feedback inbox</h3>
                <p className="ds-caption text-muted-foreground">
                  Three sample responses. Review them to update the counts.
                </p>
              </div>
              <Badge variant="outline">Local example</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p id={`${id}-progress-label`} className="ds-label">
                  Review progress
                </p>
                <span className="ds-caption text-muted-foreground">
                  {reviewed} of {rows.length} reviewed · {progress}%
                </span>
              </div>
              <Progress
                id={`${id}-progress`}
                value={progress}
                aria-labelledby={`${id}-progress-label`}
                aria-valuetext={`${reviewed} of ${rows.length} responses reviewed`}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList
                aria-label="Filter sample feedback"
                className="max-w-full"
              >
                <TabsTrigger ref={allTab} value="all">
                  All {rows.length}
                </TabsTrigger>
                <TabsTrigger value="new">
                  New {rows.length - reviewed}
                </TabsTrigger>
                <TabsTrigger value="reviewed">Reviewed {reviewed}</TabsTrigger>
              </TabsList>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal aria-hidden="true" className="size-4" />
                    View
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="space-y-4" align="end">
                  <p className="ds-label">Table density</p>
                  <div className="flex min-h-11 items-center justify-between gap-4">
                    <Label htmlFor={`${id}-compact`}>Compact rows</Label>
                    <Switch
                      id={`${id}-compact`}
                      checked={compact}
                      onCheckedChange={setCompact}
                    />
                  </div>
                  <p className="ds-caption text-muted-foreground">
                    Controls keep their touch target while the row spacing
                    changes.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <TabsContent value={filter} className="m-0">
            <div
              role="region"
              aria-label="Sample feedback table"
              ref={tableRegion}
              tabIndex={0}
              className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring [&>[data-slot=table-container]]:overflow-visible"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Feedback</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell
                        className={`min-w-60 max-w-96 whitespace-normal pl-6 ${compact ? "py-2" : "py-5"}`}
                      >
                        <p className="ds-label">{row.message}</p>
                        <p className="ds-caption mt-1 text-muted-foreground">
                          {row.location}
                        </p>
                      </TableCell>
                      <TableCell className="ds-code">{row.rating}</TableCell>
                      <TableCell>
                        <Badge variant={row.reviewed ? "secondary" : "outline"}>
                          {row.reviewed ? "Reviewed" : "New"}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="ghost"
                          aria-label={`${row.reviewed ? "Reopen" : "Review"} feedback ${row.id}`}
                          ref={(node) => {
                            rowActions.current[row.id] = node;
                          }}
                          onClick={() => {
                            if (filter !== "all") {
                              const index = visible.findIndex(
                                (item) => item.id === row.id,
                              );
                              focusAfterReview.current = {
                                rowId:
                                  visible[index + 1]?.id ??
                                  visible[index - 1]?.id,
                              };
                            }
                            setRows((current) =>
                              current.map((item) =>
                                item.id === row.id
                                  ? { ...item, reviewed: !item.reviewed }
                                  : item,
                              ),
                            );
                            setNotice(
                              `Feedback ${row.id} marked ${row.reviewed ? "new" : "reviewed"}.`,
                            );
                          }}
                        >
                          {row.reviewed ? "Reopen" : "Review"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {visible.length === 0 ? (
                <div className="space-y-3 p-8 text-center">
                  <Inbox
                    aria-hidden="true"
                    className="mx-auto size-6 text-muted-foreground"
                  />
                  <h4 className="ds-title">
                    {filter === "new"
                      ? "All caught up."
                      : "Nothing reviewed yet."}
                  </h4>
                  <p className="ds-body text-muted-foreground">
                    No responses in this view.
                  </p>
                  <Button
                    variant="outline"
                    ref={emptyAction}
                    onClick={() => {
                      setFilter("all");
                      allTab.current?.focus();
                    }}
                  >
                    View all feedback
                  </Button>
                </div>
              ) : null}
            </div>
          </TabsContent>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3">
            <p role="status" className="ds-caption text-muted-foreground">
              {notice || `${visible.length} sample responses in this view.`}
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setRows(sampleFeedback);
                setFilter("all");
                setNotice("Sample feedback reset.");
              }}
            >
              Reset example
            </Button>
          </div>
        </div>
      </Tabs>
      <p className="ds-caption text-muted-foreground">
        Table · Tabs · Progress · Popover — horizontal overflow stays inside the
        table on small screens.
      </p>
    </section>
  );
}

function OverlaySpecimens() {
  const [deleted, setDeleted] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const restoreRef = useRef<HTMLButtonElement>(null);
  const removeRef = useRef<HTMLButtonElement>(null);
  const focusAfterRestore = useRef(false);
  useEffect(() => {
    if (!deleted && focusAfterRestore.current) {
      removeRef.current?.focus();
      focusAfterRestore.current = false;
    }
  }, [deleted]);
  return (
    <section
      id="overlays"
      aria-labelledby="overlays-title"
      className="space-y-6 scroll-mt-24"
    >
      <div className="space-y-2">
        <p className="ds-eyebrow text-muted-foreground">05 / Overlays</p>
        <h2 id="overlays-title" className="ds-section-title">
          Keep the surrounding task in sight.
        </h2>
        <p className="ds-body max-w-prose text-muted-foreground">
          A sheet holds supporting detail. A confirmation names the exact
          consequence and gives cancellation equal clarity.
        </p>
      </div>
      <div className="ds-panel space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="ds-title">Atlas demo project</h3>
            <p className="ds-body text-muted-foreground">
              {deleted
                ? "Removed from this example only."
                : "A draft project used to demonstrate overlay behavior."}
            </p>
          </div>
          <Badge variant="secondary">{deleted ? "Removed" : "Draft"}</Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">View project details</Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader className="p-6">
                <SheetTitle className="ds-title">Atlas demo project</SheetTitle>
                <SheetDescription>
                  Local example. This sheet does not read or change a real
                  project.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 px-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="ds-caption text-muted-foreground">Status</dt>
                    <dd className="ds-body">
                      {deleted ? "Removed in this example" : "Draft"}
                    </dd>
                  </div>
                  <div>
                    <dt className="ds-caption text-muted-foreground">Widget</dt>
                    <dd className="ds-body">Emoji feedback</dd>
                  </div>
                </dl>
                <div className="ds-inset space-y-3 p-4">
                  <p className="ds-label">Readiness review</p>
                  <p className="ds-body text-muted-foreground">
                    Check the question, the placement, and the follow-up before
                    publishing.
                  </p>
                  <Badge variant={reviewed ? "default" : "outline"}>
                    {reviewed ? "Reviewed" : "Needs review"}
                  </Badge>
                </div>
                <p role="status" className="ds-caption text-muted-foreground">
                  {reviewed
                    ? "Marked reviewed for this example."
                    : "Review status is local to this page."}
                </p>
              </div>
              <SheetFooter className="p-6">
                <Button onClick={() => setReviewed((value) => !value)}>
                  {reviewed ? "Reopen review" : "Mark as reviewed"}
                </Button>
                <SheetClose asChild>
                  <Button variant="outline">Close details</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button ref={removeRef} variant="destructive" disabled={deleted}>
                <Trash2 aria-hidden="true" className="size-4" />
                Remove demo project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              onCloseAutoFocus={(event) => {
                if (deleted) {
                  event.preventDefault();
                  restoreRef.current?.focus();
                }
              }}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Remove Atlas from this example?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This changes only the sample card on this page. No real
                  project or feedback is deleted. You can restore the example
                  immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep project</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => setDeleted(true)}
                >
                  Remove example
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {deleted ? (
            <Button
              ref={restoreRef}
              variant="outline"
              onClick={() => {
                focusAfterRestore.current = true;
                setDeleted(false);
              }}
            >
              Restore example project
            </Button>
          ) : null}
        </div>
        <p role="status" className="ds-caption text-muted-foreground">
          {deleted
            ? "Demo project removed. Restore it to repeat the confirmation."
            : "Press Escape or use the close action to return to the page."}
        </p>
      </div>
      <p className="ds-caption text-muted-foreground">
        Sheet · AlertDialog — focus moves into the overlay and returns to a
        useful control. Destructive intent uses explicit language.
      </p>
    </section>
  );
}
