"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Panel } from "./panel";
import { SyncUserGate } from "./sync-user-gate";
import { useEffect, useMemo, useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

function formatDate(ms: number) {
  return new Date(ms).toLocaleString();
}

function maskKey(key: string) {
  if (!key.startsWith("sk_")) return "••••••";
  if (key.length <= 10) return "sk_••••";
  const start = key.slice(0, 7); // sk_ + 4
  const end = key.slice(-4);
  return `${start}…${end}`;
}

export function ProjectClient({ projectId }: { projectId: string }) {
  return (
    <div className="space-y-8">
      <SyncUserGate>
        <ProjectInner projectId={projectId} />
      </SyncUserGate>
    </div>
  );
}

function ProjectInner({ projectId: propProjectId }: { projectId: string }) {
  const router = useRouter();
  const params = useParams<{ projectId?: string | string[] }>();

  const routeProjectId =
    typeof params?.projectId === "string"
      ? params.projectId
      : Array.isArray(params?.projectId)
        ? params?.projectId[0]
        : "";

  const effectiveProjectId = propProjectId || routeProjectId;

  const queryArgs =
    typeof effectiveProjectId === "string" && effectiveProjectId.length > 0
      ? { projectId: effectiveProjectId as Id<"projects"> }
      : "skip";

  const data = useQuery(api.projects.getProject, queryArgs);

  const rotateKey = useMutation(api.projects.generateApiKey);
  const deleteProject = useMutation(api.projects.deleteProject);

  const [revealKey, setRevealKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (queryArgs !== "skip") return;
    router.replace("/dashboard");
  }, [queryArgs, router]);

  if (queryArgs === "skip") {
    return (
      <Panel>
        <div className="text-sm text-muted-foreground">Redirecting…</div>
      </Panel>
    );
  }

  const project = data?.project;
  const convexProjectId = project?._id;
  const activeKey = data?.activeApiKey?.key;
  const keyDisplay = useMemo(() => {
    if (!activeKey) return "—";
    return revealKey ? activeKey : maskKey(activeKey);
  }, [activeKey, revealKey]);

  async function onCopy() {
    if (!activeKey) return;
    try {
      await navigator.clipboard.writeText(activeKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      window.prompt("Copy API key:", activeKey);
    }
  }

  async function onRotate() {
    if (!convexProjectId) return;
    if (
      !window.confirm("Rotate API key? Existing widgets will stop working.")
    ) {
      return;
    }
    setRotating(true);
    try {
      await rotateKey({ projectId: convexProjectId });
      setRevealKey(true);
      setCopied(false);
    } finally {
      setRotating(false);
    }
  }

  async function onDelete() {
    if (!convexProjectId) return;
    if (
      !window.confirm("Delete this project? This also deletes feedback + keys.")
    ) {
      return;
    }
    setDeleting(true);
    try {
      await deleteProject({ projectId: convexProjectId });
      router.push("/dashboard");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" className="-ml-2">
          <Link href="/dashboard">← Projects</Link>
        </Button>
      </div>

      {project ? (
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Created {formatDate(project.createdAt)}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="h-7 w-64 animate-pulse rounded bg-muted/70" />
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        </div>
      )}

      <Panel>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">API key</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Use this key to authenticate public widget feedback writes.
              </div>
            </div>
            <div className="inline-flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                aria-pressed={revealKey}
                onClick={() => setRevealKey((v) => !v)}
                disabled={!activeKey}
              >
                {revealKey ? "Hide" : "Reveal"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCopy}
                disabled={!activeKey}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-background px-3 py-2 font-mono text-sm">
            {data ? (
              keyDisplay
            ) : (
              <span className="inline-block h-4 w-72 animate-pulse rounded bg-muted/70 align-middle" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={onRotate}
              disabled={!data || rotating}
            >
              {rotating ? "Rotating…" : "Rotate key"}
            </Button>
          </div>
        </div>
      </Panel>

      <Panel className="border-destructive/30">
        <div className="space-y-3">
          <div className="text-sm font-semibold">Danger zone</div>
          <div className="text-sm text-muted-foreground">
            Deleting a project permanently removes its feedback and keys.
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={!data || deleting}
          >
            {deleting ? "Deleting…" : "Delete project"}
          </Button>
        </div>
      </Panel>
    </div>
  );
}
