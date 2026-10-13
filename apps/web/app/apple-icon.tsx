import { ImageResponse } from "next/og";
import { Activity } from "lucide-react";
import { renderToReadableStream } from "react-dom/server.edge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const activity = await new Response(
    await renderToReadableStream(
      <Activity size={120} strokeWidth={1.75} color="white" />,
    ),
  ).text();
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: "#432dd7",
        color: "white",
        borderRadius: 36,
      }}
    >
      {/* ImageResponse needs an image because Satori does not expand Lucide's forwardRef. */}
      <img
        src={`data:image/svg+xml;base64,${Buffer.from(activity).toString("base64")}`}
        width={120}
        height={120}
        alt=""
      />
    </div>,
    size,
  );
}
