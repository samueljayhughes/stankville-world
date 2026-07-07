import { redis } from "@devvit/redis";

export class StorageManager {

  private static playerKey(
    userId: string,
    namespace: string
  ): string {
    return `player:${userId}:${namespace}`;
  }


  static async getPlayerProfile(userId: string) {
    const data = await redis.get(
      this.playerKey(userId, "profile")
    );

    return data ? JSON.parse(data) : null;
  }


  static async setPlayerProfile(
    userId: string,
    profile: unknown
  ) {
    await redis.set(
      this.playerKey(userId, "profile"),
      JSON.stringify(profile)
    );
  }


  static async getPlayerStats(userId: string) {
    const data = await redis.get(
      this.playerKey(userId, "stats")
    );

    return data
      ? JSON.parse(data)
      : {
          xp: 0,
          level: 1,
          reputation: 0,
        };
  }


  static async setPlayerStats(
    userId: string,
    stats: unknown
  ) {
    await redis.set(
      this.playerKey(userId, "stats"),
      JSON.stringify(stats)
    );
  }


  static async getInventory(userId: string) {
    const data = await redis.get(
      this.playerKey(userId, "inventory")
    );

    return data ? JSON.parse(data) : [];
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
