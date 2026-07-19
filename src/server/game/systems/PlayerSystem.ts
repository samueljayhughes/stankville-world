import { GameEngine } from "../engine/GameEngine";
import type { PlayerProfile, PlayerStats } from "../../../shared/types";

export class PlayerSystem {
  private engine: GameEngine;

  constructor() {
    this.engine = GameEngine.get();
  }

  /**
   * Get or create player profile
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
   * Get player stats
   */
  public async getStats(userId: string): Promise<PlayerStats> {
    return await this.engine.getPlayerStats(userId);
  }

  /**
   * Add XP
   */
  public async addXP(userId: string, amount: number): Promise<PlayerStats> {
    if (amount <= 0) {
      return await this.getStats(userId);
    }
    return await this.engine.addXP(userId, amount);
  }

  /**
   * Bootstrap player
   */
  public async bootstrapPlayer(userId: string) {
    const [profile, stats, equipment] = await Promise.all([
      this.getOrCreateProfile(userId),
      this.getStats(userId),
      this.engine.getEquipment(userId),
    ]);

    return { profile, stats, equipment };
  }
}
