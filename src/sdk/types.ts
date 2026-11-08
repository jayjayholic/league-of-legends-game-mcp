// Typed models for the Riot Live Client Data API (https://127.0.0.1:2999).
// Shapes mirror the API responses; fields are not guaranteed by Riot across patches.

export interface AbilityInfo {
  abilityLevel: number;
  displayName: string;
  id: string;
  rawDescription: string;
  rawDisplayName: string;
}

export interface ActivePlayerAbilities {
  E: AbilityInfo;
  Passive: AbilityInfo;
  Q: AbilityInfo;
  R: AbilityInfo;
  W: AbilityInfo;
}

export interface ChampionStats {
  abilityHaste: number;
  abilityPower: number;
  armor: number;
  armorPenetrationFlat: number;
  armorPenetrationPercent: number;
  attackDamage: number;
  attackRange: number;
  attackSpeed: number;
  bonusArmorPenetrationPercent: number;
  bonusMagicPenetrationPercent: number;
  critChance: number;
  critDamage: number;
  currentHealth: number;
  healShieldPower: number;
  healthRegenRate: number;
  lifeSteal: number;
  magicLethality: number;
  magicPenetrationFlat: number;
  magicPenetrationPercent: number;
  magicResist: number;
  maxHealth: number;
  moveSpeed: number;
  omnivamp: number;
  physicalLethality: number;
  physicalVamp: number;
  resourceMax: number;
  resourceRegenRate: number;
  resourceType: string;
  resourceValue: number;
  spellVamp: number;
  tenacity: number;
}

export interface RuneInfo {
  displayName: string;
  id: number;
  rawDescription: string;
  rawDisplayName: string;
}

export interface StatRune {
  id: number;
  rawDescription: string;
}

export interface FullRunes {
  generalRunes: RuneInfo[];
  keystone: RuneInfo;
  primaryRuneTree: RuneInfo;
  secondaryRuneTree: RuneInfo;
  statRunes: StatRune[];
}

export interface SummonerSpellInfo {
  displayName: string;
  rawDescription: string;
  rawDisplayName: string;
}

export interface SummonerSpells {
  summonerSpellOne: SummonerSpellInfo;
  summonerSpellTwo: SummonerSpellInfo;
}

export interface ActivePlayer {
  abilities: ActivePlayerAbilities;
  championStats: ChampionStats;
  currentGold: number;
  fullRunes: FullRunes;
  level: number;
  riotId: string;
  riotIdGameName: string;
  riotIdTagLine: string;
  summonerName: string;
  summonerSpells: SummonerSpells;
  teamRelativeColors: boolean;
}

export interface PlayerItem {
  canUse: boolean;
  consumable: boolean;
  count: number;
  displayName: string;
  itemID: number;
  price: number;
  rawDescription: string;
  rawDisplayName: string;
  slot: number;
}

export interface PlayerScores {
  assists: number;
  creepScore: number;
  deaths: number;
  kills: number;
  wardScore: number;
}

export type TeamId = "ORDER" | "CHAOS";
export type Position = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY" | "";

export interface PlayerData {
  championName: string;
  isBot: boolean;
  isDead: boolean;
  items: PlayerItem[];
  level: number;
  position: Position;
  rawChampionName: string;
  rawSkinName?: string;
  respawnTimer: number;
  riotId: string;
  riotIdGameName: string;
  riotIdTagLine: string;
  runes: {
    keystone: RuneInfo;
    primaryRuneTree: RuneInfo;
    secondaryRuneTree: RuneInfo;
  };
  scores: PlayerScores;
  skinID: number;
  skinName?: string;
  summonerName: string;
  summonerSpells: SummonerSpells;
  team: TeamId;
}

export type GameEventName =
  | "GameStart"
  | "MinionsSpawning"
  | "FirstBrick"
  | "FirstBlood"
  | "TurretKilled"
  | "InhibKilled"
  | "InhibRespawningSoon"
  | "InhibRespawned"
  | "DragonKill"
  | "HeraldKill"
  | "BaronKill"
  | "HordeKill"
  | "ChampionKill"
  | "Multikill"
  | "Ace"
  | "GameEnd";

export interface BaseGameEvent {
  EventID: number;
  EventName: GameEventName;
  EventTime: number;
}

export interface DragonKillEvent extends BaseGameEvent {
  EventName: "DragonKill";
  DragonType: "Fire" | "Water" | "Earth" | "Air" | "Hextech" | "Chemtech" | "Elder";
  Stolen: string;
  KillerName: string;
  Assisters: string[];
}

export interface BaronKillEvent extends BaseGameEvent {
  EventName: "BaronKill";
  Stolen: string;
  KillerName: string;
  Assisters: string[];
}

export interface HeraldKillEvent extends BaseGameEvent {
  EventName: "HeraldKill";
  Stolen: string;
  KillerName: string;
  Assisters: string[];
}

export interface ChampionKillEvent extends BaseGameEvent {
  EventName: "ChampionKill";
  KillerName: string;
  VictimName: string;
  Assisters: string[];
}

export interface TurretKillEvent extends BaseGameEvent {
  EventName: "TurretKilled";
  TurretKilled: string;
  KillerName: string;
  Assisters: string[];
}

export interface InhibKillEvent extends BaseGameEvent {
  EventName: "InhibKilled";
  InhibKilled: string;
  KillerName: string;
  Assisters: string[];
}

export interface GameEndEvent extends BaseGameEvent {
  EventName: "GameEnd";
  Result: "Win" | "Lose";
}

export interface HordeKillEvent extends BaseGameEvent {
  EventName: "HordeKill";
  KillerName: string;
  Assisters: string[];
}

export type GameEvent =
  | BaseGameEvent
  | DragonKillEvent
  | BaronKillEvent
  | HeraldKillEvent
  | HordeKillEvent
  | ChampionKillEvent
  | TurretKillEvent
  | InhibKillEvent
  | GameEndEvent;

export type MapTerrain = "Default" | "Fire" | "Water" | "Earth" | "Air" | "Hextech" | "Chemtech";

export interface GameData {
  gameMode: string;
  gameTime: number;
  mapName: string;
  mapNumber: number;
  mapTerrain: MapTerrain;
}

export interface EventData {
  Events: GameEvent[];
}

export interface AllGameData {
  activePlayer: ActivePlayer;
  allPlayers: PlayerData[];
  events: EventData;
  gameData: GameData;
}
