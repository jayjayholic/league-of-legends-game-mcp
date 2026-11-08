import type {
  ActivePlayer,
  ActivePlayerAbilities,
  AllGameData,
  EventData,
  GameData,
  PlayerData,
  PlayerScores,
} from "./types";
import { GameNotRunningError, RiotApiError, RiotApiTimeoutError } from "./errors";

export const DEFAULT_BASE_URL = "https://127.0.0.1:2999";
export const DEFAULT_TIMEOUT_MS = 2000;

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface LiveClientOptions {
  /** Origin of the Live Client Data API. Injected by tests to point at a fake server. */
  baseUrl?: string;
  /** Per-request timeout in milliseconds. */
  timeoutMs?: number;
  /** Replacement for the global fetch, mainly for tests. */
  fetch?: FetchLike;
}

export class LiveClient {
  readonly baseUrl: string;
  readonly timeoutMs: number;
  private readonly fetchImpl: FetchLike;

  constructor(options: LiveClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchImpl = options.fetch ?? ((input, init) => fetch(input, init));
  }

  /** Full game snapshot: active player, all players, events and game data. */
  getAllGameData(): Promise<AllGameData> {
    return this.get<AllGameData>("/liveclientdata/allgamedata");
  }

  getActivePlayer(): Promise<ActivePlayer> {
    return this.get<ActivePlayer>("/liveclientdata/activeplayer");
  }

  /** Riot ID-style summoner name of the local player. */
  getActivePlayerName(): Promise<string> {
    return this.get<string>("/liveclientdata/activeplayername");
  }

  getActivePlayerAbilities(): Promise<ActivePlayerAbilities> {
    return this.get<ActivePlayerAbilities>("/liveclientdata/activeplayerabilities");
  }

  getPlayerList(): Promise<PlayerData[]> {
    return this.get<PlayerData[]>("/liveclientdata/playerlist");
  }

  /** Scores of one player, identified by summoner name. */
  getPlayerScores(summonerName: string): Promise<PlayerScores> {
    return this.get<PlayerScores>("/liveclientdata/playerscores", { summonerName });
  }

  getEventData(): Promise<EventData> {
    return this.get<EventData>("/liveclientdata/eventdata");
  }

  getGameStats(): Promise<GameData> {
    return this.get<GameData>("/liveclientdata/gamestats");
  }

  private async get<T>(path: string, query?: Record<string, string>): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value);
      }
    }

    const response = await this.send(url);

    if (!response.ok) {
      throw new RiotApiError(`Live Client Data API responded with HTTP ${response.status} for ${path}`, {
        status: response.status,
      });
    }

    try {
      return (await response.json()) as T;
    } catch (cause) {
      throw new RiotApiError(`Live Client Data API returned invalid JSON for ${path}`, { cause });
    }
  }

  private async send(url: URL): Promise<Response> {
    const init: RequestInit & { tls?: { rejectUnauthorized: boolean } } = {
      signal: AbortSignal.timeout(this.timeoutMs),
    };

    // The game serves a self-signed certificate on loopback only; never relax TLS for other hosts.
    if (url.protocol === "https:" && url.hostname === "127.0.0.1") {
      init.tls = { rejectUnauthorized: false };
    }

    try {
      return await this.fetchImpl(url.toString(), init);
    } catch (cause) {
      if (isTimeoutError(cause)) {
        throw new RiotApiTimeoutError(`Live Client Data API did not respond within ${this.timeoutMs} ms`, {
          cause,
        });
      }
      throw new GameNotRunningError(`No League of Legends game is reachable at ${this.baseUrl}`, { cause });
    }
  }
}

function isTimeoutError(cause: unknown): boolean {
  return cause instanceof Error && (cause.name === "TimeoutError" || cause.name === "AbortError");
}
