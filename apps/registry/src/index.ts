import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use("*", cors());

app.get("/r/:name.json", async (c) => {
  const name = c.req.param("name");
  return c.env.ASSETS.fetch(new Request(`http://registry/r/${name}.json`));
});

export default app;
