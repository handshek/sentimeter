import { getAgentIndex } from "../_lib/widget-markdown";

export const dynamic = "force-static";

export function GET() {
  return new Response(getAgentIndex(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
