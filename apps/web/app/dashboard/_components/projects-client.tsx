"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Panel } from "./panel";
import { SyncUserGate } from "./sync-user-gate";

function formatDate(ms: number) {
  return new Date(ms).toLocaleString();
}

export function ProjectsClient() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Create a project to generate an API key for widget feedback.
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
  const canSubmit = name.trim().length > 0 && !submitting;

  const isLoading = projects === undefined;
  const projectList = projects ?? [];

  const emptyState = useMemo(() => {
    if (isLoading) return null;
    if (projectList.length > 0) return null;
    return (
      <Panel>
        <div className="space-y-2">
          <div className="text-sm font-semibold">Create your first project</div>
          <div className="text-sm text-muted-foreground">
            Projects group widgets and API keys. Start by naming one.
          </div>
        </div>
      </Panel>
    );
  }, [isLoading, projectList.length]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const result = await createProject({ name: name.trim() });
      setName("");
      router.push(`/dashboard/projects/${result.project._id}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Panel>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="text-sm font-semibold">New project</div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="project-name">
              Project name
            </label>
            <input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="h-10 w-full rounded-md border border-border/70 bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button type="submit" disabled={!canSubmit} className="h-10">
              {submitting ? "Creating…" : "Create"}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Creating a project automatically generates the first API key.
          </div>
        </form>
      </Panel>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          <div className="h-28 w-full animate-pulse rounded bg-muted/70" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div className="text-sm font-semibold">Your projects</div>
            <div className="text-xs text-muted-foreground">
              {projectList.length} total
            </div>
          </div>

          {projectList.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {projectList.map((p) => (
                <Panel key={p._id} className="p-0">
                  <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Created {formatDate(p.createdAt)}
                      </div>
                    </div>
                    <Button asChild variant="outline">
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
