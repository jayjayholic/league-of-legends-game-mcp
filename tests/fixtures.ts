import type { ActivePlayer, GameData } from "../src/sdk/types";

export const activePlayerFixture = {
  summonerName: "Summoner One",
  riotIdGameName: "Summoner",
  riotIdTagLine: "BR1",
  level: 9,
  currentGold: 1250,
  teamRelativeColors: true,
} as unknown as ActivePlayer;

export const gameStatsFixture: GameData = {
  gameMode: "CLASSIC",
  gameTime: 612.5,
  mapName: "Map11",
  mapNumber: 11,
  mapTerrain: "Default",
};
