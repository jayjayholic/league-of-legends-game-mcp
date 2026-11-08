# league-of-legends-game-mcp

A TypeScript SDK for the local Riot Live Client Data API, plus a Model Context Protocol (MCP) server that exposes the live game state as tools.

The API is served by the League of Legends client on `https://127.0.0.1:2999` while a game is running. The SDK is a typed client for it; the MCP server lets an AI assistant query the game through six read-only tools.

> **Disclaimer:** This project is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

## Requirements

- [Bun](https://bun.sh) 1.x
- A running League of Legends game on the same machine (the Live Client Data API is only available during a match)

## Install

```sh
git clone https://github.com/jayjayholic/league-of-legends-game-mcp.git
cd league-of-legends-game-mcp
bun install
```

## Run the MCP server

The server speaks MCP over stdio. Point your MCP client at it, for example:

```json
{
  "mcpServers": {
    "league-of-legends": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/league-of-legends-game-mcp/src/mcp/server.ts"]
    }
  }
}
```

## Tools

| Tool | Returns |
| --- | --- |
| `get_game_status` | `{ running, gameMode?, mapName?, gameTime? }`; `running: false` when no game is reachable |
| `get_active_player` | Local player: summoner name, level, gold, champion stats |
| `get_active_player_abilities` | Passive and Q/W/E/R abilities with levels |
| `get_players` | All players: champion, team, position, scores, items |
| `get_game_stats` | Game mode, map, terrain and game time |
| `get_events` | Game events so far (kills, objectives, start and end) |

Every tool returns its result as JSON text. Errors are returned as tool errors with a readable message.

## SDK usage

```ts
import { LiveClient, GameNotRunningError } from "./src/sdk/index";

const client = new LiveClient({ timeoutMs: 2000 });

try {
  const player = await client.getActivePlayer();
  console.log(player.summonerName);
} catch (error) {
  if (error instanceof GameNotRunningError) {
    console.log("No game is running.");
  } else {
    throw error;
  }
}
```

Options: `baseUrl` (default `https://127.0.0.1:2999`, injectable for tests), `timeoutMs` (default 2000) and `fetch` (replacement fetch implementation).

Errors: `GameNotRunningError` (port closed or refused), `RiotApiTimeoutError` (no answer within the timeout), `RiotApiError` (non-2xx status or invalid JSON, with `status`).

### TLS note

The game uses a self-signed certificate. Certificate verification is disabled only when the request host is exactly `127.0.0.1`. Requests to any other host keep normal verification.

## Development

```sh
bun run test       # vitest suite (SDK and MCP tool call against a local fake server)
bun run typecheck  # tsc --noEmit, strict mode
bun run start      # run the MCP server on stdio
```

Tests use a plain-HTTP fake server on a random loopback port; no game is needed.

## License

MIT. See [LICENSE](LICENSE).
