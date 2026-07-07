import { redis } from "@devvit/redis";
import { Inventory } from "../models/Inventory";

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

}
