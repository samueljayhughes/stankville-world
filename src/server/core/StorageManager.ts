import { redis } from "@devvit/redis";
import { Inventory } from "../models/Inventory";
import { Equipment } from "../models/Equipment";
import { CombatSession } from "../game/models/CombatSession";
import type { PlayerStats, PlayerProfile } from "../../shared/types";

export class StorageManager {

  private static playerKey(
    userId: string,
    namespace: string
  ): string {
    return `player:${userId}:${namespace}`;
  }


  // -------------------------
  // Player Profile
  // -------------------------

  static async getPlayerProfile(
    userId: string
  ): Promise<PlayerProfile | null> {

    const data = await redis.get(
      this.playerKey(userId, "profile")
    );

    if (!data) {
      return null;
    }

    return JSON.parse(data) as PlayerProfile;
  }


  static async setPlayerProfile(
    userId: string,
    profile: PlayerProfile
  ): Promise<void> {

    await redis.set(
      this.playerKey(userId, "profile"),
      JSON.stringify(profile)
    );
  }


  // -------------------------
  // Player Stats
  // -------------------------

  static async getPlayerStats(
    userId: string
  ): Promise<PlayerStats> {

    const data = await redis.get(
      this.playerKey(userId, "stats")
    );


    if (!data) {
      return {
        xp: 0,
        level: 1,
        reputation: 0,
      };
    }


    return JSON.parse(data) as PlayerStats;
  }


  static async setPlayerStats(
    userId: string,
    stats: PlayerStats
  ): Promise<void> {

    await redis.set(
      this.playerKey(userId, "stats"),
      JSON.stringify(stats)
    );
  }


  // -------------------------
  // Inventory
  // -------------------------

  static async setInventory(
    userId: string,
    inventory: Inventory
  ): Promise<void> {

    await redis.set(
      this.playerKey(userId, "inventory"),
      JSON.stringify(inventory)
    );
  }


  static async getInventory(
    userId: string
  ): Promise<Inventory> {

    const data = await redis.get(
      this.playerKey(userId, "inventory")
    );


    if (!data) {
      return {
        capacity: 20,
        items: [],
      };
    }


    return JSON.parse(data) as Inventory;
  }


  // -------------------------
  // Equipment
  // -------------------------

  static async getEquipment(
    userId: string
  ): Promise<Equipment> {

    const data = await redis.get(
      this.playerKey(userId, "equipment")
    );


    if (!data) {
      return {};
    }


    return JSON.parse(data) as Equipment;
  }


  static async setEquipment(
    userId: string,
    equipment: Equipment
  ): Promise<void> {

    await redis.set(
      this.playerKey(userId, "equipment"),
      JSON.stringify(equipment)
    );
  }


  // -------------------------
  // Combat Sessions
  // -------------------------

  private static combatKey(
    sessionId: string
  ): string {

    return `combat:${sessionId}`;
  }


  static async setCombatSession(
    session: CombatSession
  ): Promise<void> {

    await redis.set(
      this.combatKey(session.id),
      JSON.stringify(session)
    );
  }


  static async getCombatSession(
    sessionId: string
  ): Promise<CombatSession | null> {

    const data = await redis.get(
      this.combatKey(sessionId)
    );


    if (!data) {
      return null;
    }


    return JSON.parse(data) as CombatSession;
  }


  static async deleteCombatSession(
    sessionId: string
  ): Promise<void> {

    await redis.del(
      this.combatKey(sessionId)
    );
  }

}
