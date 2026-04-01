import { ComponentsOverview } from "./_components/widget-docs-shell";
import { widgetDocs } from "./_components/widget-docs-data";

export default function ComponentsPage() {
  return <ComponentsOverview widgets={widgetDocs} />;
}
