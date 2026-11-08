#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GameNotRunningError, LiveClient } from "../sdk/index";

type ToolResult = { content: [{ type: "text"; text: string }]; isError?: boolean };

function json(value: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}

function failure(error: unknown): ToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: "text", text: message }], isError: true };
}

async function run(task: () => Promise<unknown>): Promise<ToolResult> {
  try {
    return json(await task());
  } catch (error) {
    return failure(error);
  }
}

export function createServer(client: LiveClient = new LiveClient()): McpServer {
  const server = new McpServer({ name: "league-of-legends-game-mcp", version: "0.1.0" });

  server.registerTool(
    "get_game_status",
    {
      description: "Report whether a League of Legends game is running and, if so, its mode, map and game time.",
      inputSchema: {},
    },
    () =>
      run(async () => {
        try {
          const stats = await client.getGameStats();
          return { running: true, gameMode: stats.gameMode, mapName: stats.mapName, gameTime: stats.gameTime };
        } catch (error) {
          if (error instanceof GameNotRunningError) {
            return { running: false };
          }
          throw error;
        }
      }),
  );

  server.registerTool(
    "get_active_player",
    { description: "Return the local (active) player's summoner, level, gold and champion stats.", inputSchema: {} },
    () => run(() => client.getActivePlayer()),
  );

  server.registerTool(
    "get_active_player_abilities",
    { description: "Return the local player's passive and Q/W/E/R abilities with their levels.", inputSchema: {} },
    () => run(() => client.getActivePlayerAbilities()),
  );

  server.registerTool(
    "get_players",
    { description: "List all players in the current game with champion, team, position, KDA and items.", inputSchema: {} },
    () => run(() => client.getPlayerList()),
  );

  server.registerTool(
    "get_game_stats",
    { description: "Return game-level data: mode, map, map terrain and game time in seconds.", inputSchema: {} },
    () => run(() => client.getGameStats()),
  );

  server.registerTool(
    "get_events",
    { description: "Return the game events so far (kills, objectives, game start and end).", inputSchema: {} },
    () => run(() => client.getEventData()),
  );

  return server;
}

export async function main(): Promise<void> {
  const server = createServer();
  await server.connect(new StdioServerTransport());
}

if (import.meta.main) {
  await main();
}
