import { NPCRegistry } from "../data/NPCRegistry";

export type ExplorationResult =
  | { type: "COMBAT"; enemyId: string }
  | { type: "NPC"; npcId: string }
  | { type: "LOOT"; itemId?: string }
  | { type: "NOTHING" };

export class ExplorationSystem {
  static explore(): ExplorationResult {
    const roll = Math.random();

    if (roll < 0.60) {
      const enemies = ["sewer_rat", "trash_goblin"];
      const enemyId = enemies[Math.floor(Math.random() * enemies.length)];
      if (!enemyId) return { type: "NOTHING" };
      return { type: "COMBAT", enemyId };
    }

    if (roll < 0.80) {
      const npcIds = Object.keys(NPCRegistry);
      if (npcIds.length === 0) return { type: "NOTHING" };
      const npcId = npcIds[Math.floor(Math.random() * npcIds.length)];
      if (!npcId) return { type: "NOTHING" };
      return { type: "NPC", npcId };
    }

    if (roll < 0.95) {
      return { type: "LOOT" };
    }

    return { type: "NOTHING" };
  }
}
