import { LootRegistry } from "../data/LootRegistry";

export class LootSystem {
  /**
   * Generate loot for a defeated enemy.
   */
  static generate(enemyId: string): string[] {
    const table = LootRegistry.get(enemyId);

    if (!table) {
      return [];
    }

    const rewards: string[] = [];

    for (const drop of table.drops) {
      if (Math.random() <= drop.chance) {
        rewards.push(drop.itemId);
      }
    }

    return rewards;
  }
}
