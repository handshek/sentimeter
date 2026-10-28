"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Panel } from "./panel";
import { SyncUserGate } from "./sync-user-gate";

function formatDate(ms: number) {
  return new Date(ms).toLocaleString();
}

export function ProjectsClient() {
  return (
    <div className="min-w-0 space-y-8">
      <div className="space-y-1">
        <h1 className="ds-page-title">Projects</h1>
        <p className="ds-body text-muted-foreground">
          Create a project to generate a publishable key for widget feedback.
        </p>
      </div>

      <SyncUserGate>
        <ProjectsInner />
      </SyncUserGate>
    </div>
  );
}

function ProjectsInner() {
  const router = useRouter();
  const projects = useQuery(api.projects.getProjects, {});
  const createProject = useMutation(api.projects.createProject);

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const canSubmit = name.trim().length > 0 && !submitting;

  const isLoading = projects === undefined;
  const projectList = projects ?? [];

  const emptyState = useMemo(() => {
    if (isLoading) return null;
    if (projectList.length > 0) return null;
    return (
      <Panel>
        <div className="space-y-2">
          <div className="ds-label">Create your first project</div>
          <div className="ds-body text-muted-foreground">
            Projects group widgets and publishable keys. Start by naming one.
          </div>
        </div>
      </Panel>
    );
  }, [isLoading, projectList.length]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await createProject({ name: name.trim() });
      setName("");
      router.push(`/dashboard/projects/${result.project._id}`);
    } catch {
      setSubmitError("Could not create the project. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <Panel>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="ds-label">New project</div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Label className="sr-only" htmlFor="project-name">
              Project name
            </Label>
            <Input
              id="project-name"
              name="project-name"
              autoComplete="off"
              aria-invalid={submitError ? "true" : undefined}
              aria-describedby={submitError ? "project-name-error" : undefined}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="w-full min-w-0"
            />
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? "Creating…" : "Create"}
            </Button>
          </div>
          <div className="ds-caption text-muted-foreground">
            Creating a project automatically generates the first publishable
            key.
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {submitting ? "Creating project…" : ""}
          </p>
          {submitError ? (
            <p
              id="project-name-error"
              className="ds-caption text-destructive"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}
        </form>
      </Panel>

      {isLoading ? (
        <div className="space-y-3" role="status" aria-live="polite">
          <span className="sr-only">Loading projects…</span>
          <div aria-hidden="true" className="space-y-3">
            <div className="h-5 w-1/2 max-w-36 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-28 w-full animate-pulse rounded bg-muted/70 motion-reduce:animate-none" />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div className="ds-label">Your projects</div>
            <div className="ds-caption text-muted-foreground">
              {projectList.length} total
            </div>
          </div>

          {projectList.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {projectList.map((p) => (
                <Panel key={p._id}>
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="break-words ds-label [overflow-wrap:anywhere]">
                        {p.name}
                      </div>
                      <div className="mt-1 ds-caption text-muted-foreground">
                        Created {formatDate(p.createdAt)}
                      </div>
                    </div>
                    <Button asChild variant="outline" className="shrink-0">
                      <Link href={`/dashboard/projects/${p._id}`}>Open</Link>
                    </Button>
                  </div>
                </Panel>
              ))}
            </div>
          ) : (
            emptyState
          )}
        </div>
      )}
    </div>
  );
}
