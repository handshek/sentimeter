import { httpRouter } from "convex/server";
import { feedbackOptions, feedbackPost } from "./httpActions";

const http = httpRouter();

http.route({
  path: "/feedback",
  method: "OPTIONS",
  handler: feedbackOptions,
});

http.route({
  path: "/feedback",
  method: "POST",
  handler: feedbackPost,
});

export default http;

