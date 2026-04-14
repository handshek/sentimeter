import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  feedbackPerKey: {
    kind: "token bucket",
    rate: 60,
    period: MINUTE,
    capacity: 10,
  },
  feedbackGlobal: {
    kind: "fixed window",
    rate: 5000,
    period: MINUTE,
  },
});
