import { ImageResponse } from "next/og";
import { Activity } from "lucide-react";
import { renderToReadableStream } from "react-dom/server.edge";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const activity = await new Response(
    await renderToReadableStream(
      <Activity size={24} strokeWidth={1.75} color="white" />,
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
        borderRadius: 7,
      }}
    >
      {/* ImageResponse needs an image because Satori does not expand Lucide's forwardRef. */}
      <img
        src={`data:image/svg+xml;base64,${Buffer.from(activity).toString("base64")}`}
        width={24}
        height={24}
        alt=""
      />
    </div>,
    size,
  );
}
