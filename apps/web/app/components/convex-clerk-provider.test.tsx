import { expect, mock, test } from "bun:test";
import { act, render, waitFor } from "@testing-library/react";
import { StrictMode, type ReactNode } from "react";

class TestClient {
  closed = false;
  close = mock(async () => {
    this.closed = true;
  });
}
let active: TestClient;

mock.module("convex/react", () => ({ ConvexReactClient: TestClient }));
mock.module("@clerk/nextjs", () => ({ useAuth: () => ({}) }));
mock.module("convex/react-clerk", () => ({
  ConvexProviderWithClerk: ({
    client,
    children,
  }: {
    client: TestClient;
    children: ReactNode;
  }) => {
    active = client;
    if (client.closed) throw new Error("Provider reused a closed client.");
    return children;
  },
}));
const { default: ConvexClientProvider } =
  await import("./convex-clerk-provider");

test("route client survives Strict Mode rehearsal and closes after leaving hosted routes", async () => {
  const view = render(
    <StrictMode>
      <ConvexClientProvider url="https://fixture.convex.cloud">
        <p>Hosted route</p>
      </ConvexClientProvider>
    </StrictMode>,
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(active.close).not.toHaveBeenCalled();
  view.unmount();
  await waitFor(() => expect(active.close).toHaveBeenCalledTimes(1));
});
