import type { FeedbackContext } from "../types";

export function collectFeedbackContext(): FeedbackContext | undefined {
  if (typeof window === "undefined") return undefined;
  const ua = window.navigator.userAgent;
  const browser = /Edg(?:e|A|iOS)?\//.test(ua)
    ? "Edge"
    : /(?:OPR|Opera)\//.test(ua)
      ? "Opera"
      : /(?:Firefox|FxiOS)\//.test(ua)
        ? "Firefox"
        : /(?:Chrome|CriOS)\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Unknown";
  const os =
    /iPhone|iPad|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && window.navigator.maxTouchPoints > 1)
      ? "iOS"
      : /Android/.test(ua)
        ? "Android"
        : /Windows/.test(ua)
          ? "Windows"
          : /Macintosh|Mac OS X/.test(ua)
            ? "macOS"
            : /Linux/.test(ua)
              ? "Linux"
              : "Unknown";
  return {
    url: window.location.href,
    route: window.location.pathname,
    browser,
    os,
    viewport: { width: window.innerWidth, height: window.innerHeight },
  };
}
