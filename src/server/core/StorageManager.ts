import { redis } from "@devvit/redis";

export class StorageManager {

  private static playerKey(
    userId: string,
    namespace: string
  ): string {
    return `player:${userId}:${namespace}`;
  }


  static async setInventory(
    userId: string,
    inventory: unknown[]
  ) {
    await redis.set(
      this.playerKey(userId, "inventory"),
      JSON.stringify(inventory)
    );
  }
}
