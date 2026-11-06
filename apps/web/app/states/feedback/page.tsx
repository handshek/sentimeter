import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FeedbackWorkbench } from "./workbench";

export const metadata: Metadata = {
  title: "Feedback state workbench",
  robots: { index: false, follow: false },
};

export default function FeedbackStatesPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <Suspense
      fallback={
        <p className="ds-container ds-body py-12">Loading the workbench…</p>
      }
    >
      <FeedbackWorkbench />
    </Suspense>
  );
}
