import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

export interface FakeRoute {
  status?: number;
  body: unknown;
  delayMs?: number;
}

export interface FakeServer {
  baseUrl: string;
  close(): Promise<void>;
}

/** Plain-HTTP stand-in for the Live Client Data API, bound to loopback on a random port. */
export async function startFakeServer(routes: Record<string, FakeRoute>): Promise<FakeServer> {
  const server: Server = createServer((request: IncomingMessage, response: ServerResponse) => {
    const path = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    const route = routes[path];

    if (!route) {
      response.writeHead(404, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "not found" }));
      return;
    }

    setTimeout(() => {
      response.writeHead(route.status ?? 200, { "content-type": "application/json" });
      response.end(JSON.stringify(route.body));
    }, route.delayMs ?? 0);
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.closeAllConnections();
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

/** Returns a loopback URL whose port was just released, so connections are refused. */
export async function closedPortUrl(): Promise<string> {
  const server = await startFakeServer({});
  await server.close();
  return server.baseUrl;
}
