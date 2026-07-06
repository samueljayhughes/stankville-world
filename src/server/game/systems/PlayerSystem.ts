import { GameEngine } from "../engine/GameEngine";
import type {
  PlayerProfile,
  PlayerStats,
  InventoryItem,
} from "../../../shared/types";

export class PlayerSystem {
  private engine: GameEngine;

  constructor() {
    this.engine = GameEngine.get();
  }

  /**
   * Get or create a player profile
   */
  public async getOrCreateProfile(userId: string): Promise<PlayerProfile> {
    const existing = await this.engine.getPlayerProfile(userId);

    if (existing) {
      return existing;
    }

    const newProfile: PlayerProfile = {
      userId,
      name: `Wanderer-${userId.slice(0, 5)}`,
      createdAt: Date.now(),
    };

    await this.engine.setPlayerProfile(userId, newProfile);

    return newProfile;
  }

  /**
   * Get player stats or initialize defaults
   */
  public async getStats(userId: string): Promise<PlayerStats> {
    return await this.engine.getPlayerStats(userId);
  }

  /**
   * Add XP and return updated stats
   */
  public async addXP(userId: string, amount: number): Promise<PlayerStats> {
    if (amount <= 0) {
      return await this.getStats(userId);
    }

    return await this.engine.addXP(userId, amount);
  }

  /**
   * Grant item to player inventory
   */
  public async grantItem(
    userId: string,
    item: Omit<InventoryItem, "id" | "createdAt">
  ): Promise<InventoryItem[]> {
    const fullItem: InventoryItem = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...item,
    };

    const inventory = await this.engine.getInventory(userId);

    const updated = [...inventory, fullItem];

    await this.engine["setInventory"]?.(userId, updated);

    return updated;
  }

  /**
   * Full player bootstrap (used by API init)
   */
  public async bootstrapPlayer(userId: string) {
    const [profile, stats, inventory] = await Promise.all([
      this.getOrCreateProfile(userId),
      this.getStats(userId),
      this.engine.getInventory(userId),
    ]);

    return {
      profile,
      stats,
      inventory,
    };
  }
}
