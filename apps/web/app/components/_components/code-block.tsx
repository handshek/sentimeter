"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "./copy-button";
import "./code-block.css";

export function CodeBlock({
  code,
  label = "Example",
  lang = "tsx",
}: {
  code: string;
  label?: string;
  lang?: string;
}) {
  const [highlighted, setHighlighted] = useState<{
    code: string;
    html: string;
  } | null>(null);
  useEffect(() => {
    let cancelled = false;
    import("shiki")
      .then(({ codeToHtml }) =>
        codeToHtml(code, {
          lang,
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
        }),
      )
      .then((html) => {
        if (!cancelled) setHighlighted({ code, html });
      })
      .catch(() => {
        /* Keep the readable plain-text fallback. */
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);
  return (
    <div className="docs-code min-w-0 overflow-hidden rounded-xl border border-border bg-muted/30">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2">
        <p className="text-sm font-medium">{label}</p>
        <CopyButton key={code} text={code} />
      </div>
      {highlighted?.code === code ? (
        <div
          tabIndex={0}
          aria-label={`${label} code`}
          translate="no"
          className="max-w-full overflow-x-auto p-4 font-mono text-[13px] leading-6 focus-visible:outline-2 focus-visible:outline-ring [&_pre]:bg-transparent!"
          dangerouslySetInnerHTML={{ __html: highlighted.html }}
        />
      ) : (
        <pre
          tabIndex={0}
          aria-label={`${label} code`}
          translate="no"
          className="max-w-full overflow-x-auto p-4 font-mono text-[13px] leading-6 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
