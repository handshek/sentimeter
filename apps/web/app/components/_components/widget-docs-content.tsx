"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
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
import {
  getCompoundSnippet,
  getUsageSnippet,
  type WidgetDemoOptions,
  type WidgetDocConfig,
} from "../../_lib/widget-catalog";
import { WidgetInstallCommand } from "./widget-install-command";
import { WidgetDemo } from "./widget-demo";
import { CodeBlock } from "./code-block";

export function WidgetDocsContent({ widget }: { widget: WidgetDocConfig }) {
  const defaults: WidgetDemoOptions = {
    layout: "stacked",
    variant: widget.defaultVariant,
    size: "default",
    showInput: false,
  };
  const [options, setOptions] = useState<WidgetDemoOptions>(defaults);
  function updateOptions(next: Partial<WidgetDemoOptions>) {
    setOptions((current) => ({ ...current, ...next }));
  }

  return (
    <div className="docs-content">
      <section id="preview" aria-label="Live Preview" className="min-w-0">
        <Tabs defaultValue="preview">
          <TabsList aria-label="Widget Example" className="mb-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="m-0">
            <div className="docs-preview ds-panel px-3 py-8 sm:px-6 sm:py-10">
              <WidgetDemo widget={widget} options={options} />
            </div>
          </TabsContent>
          <TabsContent value="code" className="m-0">
            <CodeBlock
              code={getUsageSnippet(widget, options)}
              label="Preview Code"
            />
          </TabsContent>
        </Tabs>
        <div className="px-1 pt-2">
          <p className="ds-caption text-muted-foreground">
            Runs locally—no account, project, or network request required.
          </p>
          <Accordion type="single" collapsible>
            <AccordionItem value="customize" className="border-0">
              <AccordionTrigger className="min-h-11 py-2 text-sm">
                Customize Preview
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="preview-layout">Layout</Label>
                    <Select
                      value={options.layout}
                      onValueChange={(layout) =>
                        updateOptions({
                          layout: layout as WidgetDemoOptions["layout"],
                        })
                      }
                    >
                      <SelectTrigger id="preview-layout" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stacked">Stacked</SelectItem>
                        <SelectItem value="inline">Inline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preview-variant">Variant</Label>
                    <Select
                      value={options.variant}
                      onValueChange={(variant) =>
                        updateOptions({
                          variant: variant as WidgetDemoOptions["variant"],
                        })
                      }
                    >
                      <SelectTrigger id="preview-variant" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emoji">Emoji</SelectItem>
                        <SelectItem value="icons">Icons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preview-size">Size</Label>
                    <Select
                      value={options.size}
                      onValueChange={(size) =>
                        updateOptions({
                          size: size as WidgetDemoOptions["size"],
                        })
                      }
                    >
                      <SelectTrigger id="preview-size" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["sm", "default", "md", "lg"].map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="ds-body text-muted-foreground">
                  Presets and layouts share the same parts, states, and glyph
                  options. Explore the{" "}
                  <Link href="/design-system/widgets" className="docs-link">
                    design system
                  </Link>{" "}
                  for typography, tokens, and composition rules.
                </p>
                <div className="flex min-h-11 items-center gap-3">
                  <Switch
                    id="preview-input"
                    checked={options.showInput}
                    onCheckedChange={(showInput) =>
                      updateOptions({ showInput })
                    }
                  />
                  <Label htmlFor="preview-input" className="cursor-pointer">
                    Optional Text Input
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOptions(defaults)}
                >
                  Restore Defaults
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      <section aria-labelledby="installation" className="docs-section min-w-0">
        <h2 id="installation" className="ds-section-title">
          Installation
        </h2>
        <WidgetInstallCommand
          registryName={widget.registryName}
          metadata={widget.installMetadata}
        />
      </section>
      <section aria-labelledby="usage" className="docs-section min-w-0">
        <h2 id="usage" className="ds-section-title">
          Usage
        </h2>
        <p className="ds-body text-muted-foreground">
          The local example does not store feedback. Choose Your Backend to save
          submissions. Examples follow your preview settings and keep success
          visible with{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            {"autoHide={false}"}
          </code>
          .
        </p>
        <Tabs defaultValue="local">
          <TabsList aria-label="Submission Example">
            <TabsTrigger value="local">Local Example</TabsTrigger>
            <TabsTrigger value="custom">Your Backend</TabsTrigger>
          </TabsList>
          <TabsContent value="local">
            <CodeBlock
              code={getUsageSnippet(widget, options)}
              label="Local Example"
            />
          </TabsContent>
          <TabsContent value="custom" className="docs-section">
            <p className="ds-body text-muted-foreground">
              Implement <code>/api/feedback</code> in your app. Validate the
              payload and persist it before returning success. The payload
              includes <code>location</code>, <code>widgetType</code>,{" "}
              <code>value</code>, and optional <code>text</code>.
            </p>
            <CodeBlock
              code={getUsageSnippet(widget, options, "custom")}
              label="Your Backend"
            />
          </TabsContent>
        </Tabs>
      </section>
      <section aria-labelledby="submission" className="docs-section">
        <h2 id="submission" className="ds-section-title">
          Submission Behavior
        </h2>
        <p className="ds-body text-muted-foreground">
          A custom <code>submit</code> handler saves feedback. Without one, the
          widget completes locally without sending or persisting feedback.
          Failed custom submissions remain retryable; <code>onSubmitError</code>{" "}
          receives the original error.
        </p>
        <Accordion type="single" collapsible>
          <AccordionItem value="compound">
            <AccordionTrigger className="min-h-11">
              Compound Composition
            </AccordionTrigger>
            <AccordionContent>
              <CodeBlock
                code={getCompoundSnippet(widget)}
                label="Compound Example"
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
      <section aria-labelledby="props" className="docs-section min-w-0">
        <h2 id="props" className="ds-section-title">
          Props
        </h2>
        <div
          role="region"
          aria-label={`${widget.name} Props`}
          tabIndex={0}
          className="docs-props ds-panel max-w-full overflow-x-auto focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36">Prop</TableHead>
                <TableHead className="w-48">Type</TableHead>
                <TableHead className="w-32">Default</TableHead>
                <TableHead className="min-w-64">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {widget.props.map((row) => (
                <TableRow key={row.prop}>
                  <TableCell className="ds-code">{row.prop}</TableCell>
                  <TableCell className="ds-code whitespace-normal break-words text-muted-foreground">
                    {row.type}
                  </TableCell>
                  <TableCell className="ds-code whitespace-normal break-words text-muted-foreground">
                    {row.defaultValue}
                  </TableCell>
                  <TableCell className="ds-body min-w-64 whitespace-normal">
                    {row.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
