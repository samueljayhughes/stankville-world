import { redis } from "@devvit/redis";
import { Inventory } from "../models/Inventory";
import { Equipment } from "../models/Equipment";
import { CombatSession } from "../game/models/CombatSession";

export class StorageManager {

  private static playerKey(
    userId: string,
    namespace: string
  ): string {
    return `player:${userId}:${namespace}`;
  }

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
