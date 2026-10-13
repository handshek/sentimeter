import { isIP } from "node:net";
import {
  normalizeWaitlistEmail,
  type WaitlistJoinResult,
} from "../../convex/lib/waitlistValidation";

export type WaitlistFormState = "idle" | WaitlistJoinResult | "unavailable";

export function parseForwardedIp(forwardedFor: string | null): string {
  const candidate = forwardedFor?.split(",", 1)[0]?.trim();
  if (!candidate || !/^[a-fA-F0-9:.]+$/.test(candidate)) return "unknown";
  const version = isIP(candidate);
  if (version === 4) return candidate;
  if (version === 6) {
    return new URL(`http://[${candidate}]`).hostname.slice(1, -1);
  }
  return "unknown";
}

export function prepareWaitlistSignup({
  email: rawEmail,
  honeypot,
  forwardedFor,
}: {
  email: unknown;
  honeypot: unknown;
  forwardedFor: string | null;
}):
  | { kind: "drop" }
  | { kind: "invalid" }
  | { kind: "join"; email: string; ip: string } {
  if (honeypot != null && honeypot !== "") return { kind: "drop" };
  const email = normalizeWaitlistEmail(rawEmail);
  if (!email) return { kind: "invalid" };
  return { kind: "join", email, ip: parseForwardedIp(forwardedFor) };
}
