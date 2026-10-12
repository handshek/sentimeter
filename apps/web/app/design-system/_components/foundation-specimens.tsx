import type { CSSProperties } from "react";
import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { SystemSection, UsageNote } from "./system-section";

const surfaceRoles = [
  {
    token: "background",
    foreground: "foreground",
    title: "Canvas",
    purpose: "The page behind the content.",
  },
  {
    token: "card",
    foreground: "card-foreground",
    title: "Surface",
    purpose: "A distinct group or contained workflow.",
  },
  {
    token: "muted",
    foreground: "muted-foreground",
    title: "Inset",
    purpose: "Secondary regions and quiet context.",
  },
  {
    token: "primary",
    foreground: "primary-foreground",
    title: "Action",
    purpose: "The next meaningful step.",
  },
  {
    token: "secondary",
    foreground: "secondary-foreground",
    title: "Supporting action",
    purpose: "An alternative with less emphasis.",
  },
  {
    token: "popover",
    foreground: "popover-foreground",
    title: "Overlay",
    purpose: "Temporary choices above a surface.",
  },
] as const;

export function ColorSpecimens() {
  return (
    <div>
      <SystemSection
        id="roles"
        title="Color is a relationship"
        description="Every background has a foreground. Use semantic pairs so a component can move between themes without losing contrast. Switch the theme in the header to inspect both."
      >
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {surfaceRoles.map((role) => (
            <div
              className="overflow-hidden rounded-lg border border-border"
              key={role.token}
            >
              <div
                className="flex min-h-32 items-center justify-between p-5"
                style={{
                  background: `var(--${role.token})`,
                  color: `var(--${role.foreground})`,
                }}
              >
                <span className="ds-title">Aa</span>
                <span className="ds-caption">{role.title}</span>
              </div>
              <div className="space-y-2 border-t border-border bg-card p-4">
                <p className="ds-code break-words">{role.token}</p>
                <p className="ds-caption text-muted-foreground">
                  {role.purpose}
                </p>
                <p className="ds-code break-words text-muted-foreground">
                  ↳ {role.foreground}
                </p>
              </div>
            </div>
          ))}
        </div>
      </SystemSection>
      <SystemSection
        id="meaning"
        title="Meaning beyond the brand"
        description="Status combines an icon, a plain-language message, and a semantic color. Color supports the meaning; it never carries it alone."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-success-subtle p-5 text-success">
            <CheckCircle2 className="mb-3 size-5" aria-hidden="true" />
            <h3 className="ds-label">Feedback saved</h3>
            <p className="ds-caption mt-1">Your response is ready to review.</p>
          </div>
          <div className="rounded-lg border border-border bg-warning-subtle p-5 text-warning">
            <TriangleAlert className="mb-3 size-5" aria-hidden="true" />
            <h3 className="ds-label">Review your changes</h3>
            <p className="ds-caption mt-1">
              You have edits that haven’t been saved.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-info-subtle p-5 text-info">
            <Info className="mb-3 size-5" aria-hidden="true" />
            <h3 className="ds-label">A little context</h3>
            <p className="ds-caption mt-1">This example completes locally.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <XCircle
              className="mb-3 size-5 text-destructive"
              aria-hidden="true"
            />
            <h3 className="ds-label">We couldn’t save that</h3>
            <p className="ds-caption mt-1 text-muted-foreground">
              Keep the response. Explain what to try next.
            </p>
          </div>
        </div>
        <UsageNote>
          Success, warning, and info use their subtle background roles.
          Destructive actions use the installed Button’s destructive variant;
          errors retain readable neutral body text with a semantic icon or edge.
        </UsageNote>
      </SystemSection>
      <SystemSection id="interaction" title="States should stay distinct">
        <div className="ds-panel grid gap-6 p-6 sm:grid-cols-3">
          <div className="space-y-4">
            <span className="ds-caption text-muted-foreground">Default</span>
            <Button asChild className="w-full">
              <span>Save changes</span>
            </Button>
            <p className="ds-caption text-muted-foreground">
              One primary action per group.
            </p>
          </div>
          <div className="space-y-4">
            <span className="ds-caption text-muted-foreground">
              Keyboard focus specimen
            </span>
            <Button asChild className="ds-focus w-full">
              <span>Save changes</span>
            </Button>
            <p className="ds-caption text-muted-foreground">
              A visible outer ring, separate from selection.
            </p>
          </div>
          <div className="space-y-4">
            <span className="ds-caption text-muted-foreground">Disabled</span>
            <Button className="w-full" disabled>
              Save changes
            </Button>
            <p className="ds-caption text-muted-foreground">
              A genuine disabled control, with context nearby.
            </p>
          </div>
        </div>
        <UsageNote>
          These are labeled visual specimens. Interactive state examples live in
          the Components chapter. Test custom theme pairs for contrast; semantic
          naming alone does not make a color accessible.
        </UsageNote>
      </SystemSection>
    </div>
  );
}

export function LayoutSpecimens() {
  return (
    <div>
      <SystemSection
        id="rhythm"
        title="A four-point rhythm"
        description="Use proximity to explain relationships. Close spacing joins related elements; generous spacing introduces a new idea."
      >
        <div className="ds-panel divide-y divide-border px-5">
          {[
            [4, "Question → supporting text"],
            [8, "Inside a control group"],
            [12, "Between widget sections"],
            [16, "Compact content inset"],
            [24, "Between related content groups"],
            [32, "Comfortable panel inset"],
            [48, "Between independent examples"],
            [64, "A new page section"],
          ].map(([space, use]) => (
            <div
              className="grid grid-cols-[36px_1fr] items-center gap-4 py-4 sm:grid-cols-[36px_100px_1fr]"
              key={space}
            >
              <span className="ds-code text-muted-foreground">{space}</span>
              <div
                className="hidden h-2 rounded-full bg-primary/70 sm:block"
                style={{ width: Number(space) }}
              />
              <span className="ds-label font-normal">{use}</span>
            </div>
          ))}
        </div>
      </SystemSection>
      <SystemSection
        id="composition"
        title="Different scales. Shared rules."
        description="The widget uses tight spacing. The website uses more breathing room. Both use the same hierarchy: page, section, group, control."
      >
        <div className="ds-panel overflow-hidden">
          <div className="border-b border-border bg-muted/40 px-6 py-4">
            <p className="ds-code text-muted-foreground">
              ds-container · 1200 px maximum · fluid gutters
            </p>
          </div>
          <div className="space-y-8 p-5 sm:p-8">
            <div
              className="grid grid-cols-12 gap-2"
              aria-label="12-column layout diagram"
            >
              {Array.from({ length: 12 }, (_, index) => (
                <div className="h-16 rounded-sm bg-primary/10" key={index} />
              ))}
            </div>
            <div className="grid gap-6 sm:grid-cols-[1fr_2fr]">
              <div className="ds-inset flex min-h-28 flex-col justify-center p-5">
                <p className="ds-eyebrow text-muted-foreground">Navigation</p>
                <p className="ds-label mt-3">Context stays nearby.</p>
              </div>
              <div className="space-y-3 rounded-lg border border-border p-5">
                <h3 className="ds-title">Give the content room.</h3>
                <p className="ds-body max-w-prose text-muted-foreground">
                  Reading columns stop at 65 characters. Data can use the full
                  content area. At narrow widths, supporting regions move above
                  or below the content.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            [
              "Marketing",
              "64–112 px",
              "Fluid section spacing; one clear promise at a time.",
            ],
            [
              "Documentation",
              "65ch",
              "A comfortable reading measure beside persistent navigation.",
            ],
            [
              "Product",
              "24 px",
              "Tighter groups, aligned figures, and visible control labels.",
            ],
          ].map(([name, value, description]) => (
            <div key={name} className="border-t border-border pt-5">
              <p className="ds-eyebrow text-muted-foreground">{name}</p>
              <p className="ds-section-title mt-3">{value}</p>
              <p className="ds-caption mt-3 text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </SystemSection>
      <SystemSection id="shape" title="Corners that belong together">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              name: "Control",
              radius: "var(--ds-radius-control)",
              text: "6 px · inputs and buttons",
            },
            {
              name: "Inset",
              radius: "var(--radius)",
              text: "8 px · wells and nested regions",
            },
            {
              name: "Panel",
              radius: "var(--ds-radius-panel)",
              text: "12 px · grouped surfaces",
            },
          ].map((shape) => (
            <div key={shape.name} className="space-y-3">
              <div
                className="flex h-28 items-center justify-center border border-border bg-muted"
                style={{ borderRadius: shape.radius }}
              >
                <span className="ds-label">{shape.name}</span>
              </div>
              <p className="ds-caption text-muted-foreground">{shape.text}</p>
            </div>
          ))}
        </div>
        <UsageNote>
          Radii derive from the host’s base radius, and each nested layer steps
          down: panel, then well, then the tile or field inside it. Use a small
          set of related shapes, not a new radius for every card. Pills are
          reserved for compact tags, switches, and the inline feedback bar.
        </UsageNote>
      </SystemSection>
      <SystemSection id="depth" title="Depth with a purpose">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              name: "Flat",
              shadow: "0 0 0 1px var(--border)",
              note: "Document sections and inline content.",
            },
            {
              name: "Surface",
              shadow: "var(--ds-shadow-panel)",
              note: "A hairline ring plus soft contact depth. Panels and cards.",
            },
            {
              name: "Raised",
              shadow: "var(--ds-shadow-raised)",
              note: "The same ring with ambient depth. The feedback widget and floating layers.",
            },
          ].map((level) => (
            <div key={level.name}>
              <div
                className="flex h-32 items-center justify-center rounded-xl bg-card"
                style={{ boxShadow: level.shadow } as CSSProperties}
              >
                <span className="ds-label">{level.name}</span>
              </div>
              <p className="ds-caption mt-4 text-muted-foreground">
                {level.note}
              </p>
            </div>
          ))}
        </div>
      </SystemSection>
    </div>
  );
}
