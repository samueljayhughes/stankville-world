export type ExplorationResult =
  | {
      type: "COMBAT";
      enemyId: string;
    }
  | {
      type: "NPC";
      npcId: string;
    }
  | {
      type: "LOOT";
      itemId?: string;
    }
  | {
      type: "NOTHING";
    };


export class ExplorationSystem {

  static explore(): ExplorationResult {

    const roll = Math.random();


    if (roll < 0.60) {

      const enemies = [
        "sewer_rat",
        "trash_goblin",
      ];

      const enemyId =
        enemies[
          Math.floor(Math.random() * enemies.length)
        ];

      return {
        type: "COMBAT",
        enemyId,
      };
    }


    if (roll < 0.80) {
      return {
        type: "NPC",
        npcId: "merchant",
      };
    }


    if (roll < 0.95) {
      return {
        type: "LOOT",
      };
    }


    return {
      type: "NOTHING",
    };
  }

}
