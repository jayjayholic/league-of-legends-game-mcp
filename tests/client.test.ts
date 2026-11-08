import { afterEach, describe, expect, it } from "vitest";
import { GameNotRunningError, LiveClient, RiotApiTimeoutError } from "../src/sdk/index";
import { activePlayerFixture, gameStatsFixture } from "./fixtures";
import { closedPortUrl, startFakeServer, type FakeServer } from "./fake-server";

let fake: FakeServer | undefined;

afterEach(async () => {
  await fake?.close();
  fake = undefined;
});

describe("LiveClient", () => {
  it("returns typed data from a running game", async () => {
    fake = await startFakeServer({
      "/liveclientdata/activeplayer": { body: activePlayerFixture },
    });
    const client = new LiveClient({ baseUrl: fake.baseUrl });

    const player = await client.getActivePlayer();

    expect(player.summonerName).toBe("Summoner One");
    expect(player.currentGold).toBe(1250);
  });

  it("throws GameNotRunningError when the port is closed", async () => {
    const client = new LiveClient({ baseUrl: await closedPortUrl(), timeoutMs: 1000 });

    await expect(client.getGameStats()).rejects.toBeInstanceOf(GameNotRunningError);
  });

  it("throws RiotApiTimeoutError when the API answers too late", async () => {
    fake = await startFakeServer({
      "/liveclientdata/gamestats": { body: gameStatsFixture, delayMs: 500 },
    });
    const client = new LiveClient({ baseUrl: fake.baseUrl, timeoutMs: 50 });

    await expect(client.getGameStats()).rejects.toBeInstanceOf(RiotApiTimeoutError);
  });
});
