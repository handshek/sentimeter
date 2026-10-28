"use server";

import { fetchMutation } from "convex/nextjs";
import { headers } from "next/headers";
import { api } from "@/convex/_generated/api";
import { hostedMode } from "./hosted-config";
import {
  prepareWaitlistSignup,
  type WaitlistFormState,
} from "./waitlist-request";

export async function joinWaitlist(
  _previousState: WaitlistFormState,
  formData: FormData,
): Promise<WaitlistFormState> {
  const requestHeaders = await headers();
  const signup = prepareWaitlistSignup({
    email: formData.get("email"),
    honeypot: formData.get("website"),
    forwardedFor: requestHeaders.get("x-forwarded-for"),
  });
  if (signup.kind === "drop") return "ok";
  if (signup.kind === "invalid") return "invalid";

  const secret = process.env.WAITLIST_SECRET;
  if (hostedMode() !== "waitlist" || !secret) return "unavailable";

  try {
    return await fetchMutation(api.waitlist.join, {
      email: signup.email,
      ip: signup.ip,
      source: "dashboard",
      secret,
    });
  } catch (error) {
    const details =
      error instanceof Error
        ? { name: error.name, message: error.message }
        : { name: "UnknownError", message: "Non-Error thrown" };
    for (const value of [signup.email, signup.ip, secret]) {
      if (!value) continue;
      details.name = details.name.replaceAll(value, "[redacted]");
      details.message = details.message.replaceAll(value, "[redacted]");
    }
    console.error("Waitlist signup failed", details);
    return "unavailable";
  }
}
