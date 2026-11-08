import { afterEach, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/mcp/server";
import { LiveClient } from "../src/sdk/index";
import { activePlayerFixture } from "./fixtures";
import { startFakeServer, type FakeServer } from "./fake-server";

let fake: FakeServer | undefined;
let client: Client | undefined;

afterEach(async () => {
  await client?.close();
  await fake?.close();
  client = undefined;
  fake = undefined;
});

describe("MCP server", () => {
  it("serves get_active_player as JSON text", async () => {
    fake = await startFakeServer({
      "/liveclientdata/activeplayer": { body: activePlayerFixture },
    });
    const server = createServer(new LiveClient({ baseUrl: fake.baseUrl }));
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: "test-client", version: "0.0.0" });
    await client.connect(clientTransport);

    const result = await client.callTool({ name: "get_active_player", arguments: {} });

    const first = (result.content as Array<{ type: string; text: string }>)[0];
    expect(result.isError).toBeFalsy();
    expect(first?.type).toBe("text");
    expect(JSON.parse(first?.text ?? "{}")).toMatchObject({ summonerName: "Summoner One", level: 9 });
  });
});
