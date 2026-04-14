import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app: ReturnType<typeof defineApp> = defineApp();

app.use(rateLimiter);

export default app;
