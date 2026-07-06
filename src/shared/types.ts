export type PlayerId = string;

export type Timestamp = number;

/**
 * PLAYER PROFILE
 * Static identity data
 */
export interface PlayerProfile {
  userId: PlayerId;
  name: string;
  createdAt: Timestamp;
  factionId?: string;
}

/**
 * PLAYER STATS
 * Progression system (XP, level, reputation)
 */
export interface PlayerStats {
  xp: number;
  level: number;
  reputation: number;
}

/**
 * INVENTORY ITEM
 */
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  type: "consumable" | "equipment" | "quest" | "misc";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  createdAt: Timestamp;
}

/**
 * WORLD STATE
 * Global persistent simulation
 */
export interface WorldState {
  time: Timestamp;
  weather: "clear" | "rain" | "fog" | "storm" | "acid";
  activeEvents: WorldEvent[];
}

/**
 * WORLD EVENT
 */
export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  startedAt: Timestamp;
  durationMs: number;
}

/**
 * QUEST SYSTEM
 */
export interface Quest {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  rewardXP: number;
  rewardItems?: string[];
}

/**
 * NPC
 */
export interface NPC {
  id: string;
  name: string;
  role: "vendor" | "questgiver" | "enemy" | "neutral";
  dialogue: string[];
}

/**
 * FACTION
 */
export interface Faction {
  id: string;
  name: string;
  reputation: number;
}

/**
 * API INIT RESPONSE
 */
export interface InitResponse {
  type: "init";
  postId: string;
  username: string;
  profile: PlayerProfile;
  stats: PlayerStats;
  inventory: any[];
  world: WorldState;
}

