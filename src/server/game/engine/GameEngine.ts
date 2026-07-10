import { redis, context } from "@devvit/web/server";
import { StorageManager } from "../../core/StorageManager";
import { CombatSystem } from "../systems/CombatSystem";
import { LootSystem } from "../systems/LootSystem";
import { NPCSystem } from "../systems/NPCSystem";
import { QuestSystem } from "../systems/QuestSystem";
import { EquipmentSystem } from "../systems/EquipmentSystem";
/**
 * Stankville GameEngine (v2)
 *
 * Responsibilities:
 * - Redis persistence layer
 * - Strict key management
 * - Safe player/world state access
 * - Foundation for all game systems
 */

export class GameEngine {
  private static instance: GameEngine;

  public static get(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  // -------------------------
  // Key System
  // -------------------------

  private playerKey(userId: string, namespace: string): string {
    return `player:${userId}:${namespace}`;
  }

  private worldKey(namespace: string): string {
    return `world:${namespace}`;
  }

  // -------------------------
  // Context
  // -------------------------

  public getCurrentUserId(): string | null {
    return context.userId ?? null;
  }

  public getCurrentPostId(): string | null {
    return context.postId ?? null;
  }

  // -------------------------
  // Profile
  // -------------------------

public async getPlayerProfile(userId: string) {
  return await StorageManager.getPlayerProfile(userId);
}


public async setPlayerProfile(
  userId: string,
  profile: any
) {
  await StorageManager.setPlayerProfile(
    userId,
    profile
  );
}
  // -------------------------
  // Stats
  // -------------------------

  public async getPlayerStats(userId: string) {
    return await StorageManager.getPlayerStats(userId);
  }


  public async setPlayerStats(
    userId: string,
    stats: any
  ) {
    await StorageManager.setPlayerStats(
      userId,
      stats
    );
  } 
 
  public async addXP(userId: string, amount: number) {
    const stats = await this.getPlayerStats(userId);

    stats.xp += amount;

    // Simple leveling curve
    const nextLevelXP = stats.level * 100;

    if (stats.xp >= nextLevelXP) {
      stats.level += 1;
      stats.xp -= nextLevelXP;
    }

    await this.setPlayerStats(userId, stats);

    return stats;
  }

  // -------------------------
  // Inventory
  // -------------------------

  public async getInventory(userId: string) {
    const data = await redis.get(this.playerKey(userId, "inventory"));
    return data ? JSON.parse(data) : [];
  }

  public async setInventory(userId: string, inventory: any[]) {
    await redis.set(
      this.playerKey(userId, "inventory"),
      JSON.stringify(inventory)
    );
  }

  public async addItem(userId: string, item: any) {
    const inventory = await this.getInventory(userId);

    const updated = [
      ...inventory,
      {
        id: crypto.randomUUID(),
        ...item,
      },
    ];

    await this.setInventory(userId, updated);

    return updated;
  }

  // -------------------------
  // World State
  // -------------------------

  public async getWorldState() {
    const data = await redis.get(this.worldKey("state"));

    return data
      ? JSON.parse(data)
      : {
          time: Date.now(),
          weather: "clear",
          events: [],
        };
  }

  public async setWorldState(world: any) {
    await redis.set(
      this.worldKey("state"),
      JSON.stringify(world)
    );
  }

  public async updateWorldState(update: any) {
    const current = await this.getWorldState();

    const updated = {
      ...current,
      ...update,
    };

    await this.setWorldState(updated);

    return updated;
  }

  public async tickWorld() {
    const world = await this.getWorldState();

    world.time = Date.now();

    await this.setWorldState(world);

    return world;
  }
// -------------------------
// Gameplay Systems
// -------------------------

public async attackEnemy(enemy: any, playerAttack: number) {
  return CombatSystem.playerAttack(enemy, playerAttack);
}

public async enemyAttack(playerHealth: number, enemyAttack: number) {
  return CombatSystem.enemyAttack(playerHealth, enemyAttack);
}

public async generateLoot(enemyId: string) {
  return LootSystem.generate(enemyId);
}

public getNPC(id: string) {
  return NPCSystem.getNPC(id);
}

public getNPCDialogue(id: string) {
  return NPCSystem.getDialogue(id);
}

public getQuest(id: string) {
  return QuestSystem.getQuest(id);
}

public questExists(id: string) {
  return QuestSystem.exists(id);
}

public equipItem(equipment: any, itemId: string) {
  return EquipmentSystem.equip(equipment, itemId);
}

public unequipItem(equipment: any, slot: any) {
  return EquipmentSystem.unequip(equipment, slot);
}

}
