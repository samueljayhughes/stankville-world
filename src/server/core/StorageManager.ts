import { redis } from "@devvit/redis";

export class StorageManager {

  private static playerKey(id: string) {
    return `player:${id}`;
  }

static async getPlayerProfile(
  userId: string
) {
  const data = await redis.get(
    `player:${userId}:profile`
  );

  return data
    ? JSON.parse(data)
    : null;
}


static async setPlayerProfile(
  userId:string,
  profile:any
) {
  await redis.set(
    `player:${userId}:profile`,
    JSON.stringify(profile)
  );
}

  static async savePlayer(
    id: string,
    player: unknown
  ) {
    await redis.set(
      this.playerKey(id),
      JSON.stringify(player)
    );
  }


  static async getPlayer<T>(
    id: string
  ): Promise<T | null> {

    const data = await redis.get(
      this.playerKey(id)
    );

    if (!data) {
      return null;
    }

    return JSON.parse(data) as T;
  }


  static async deletePlayer(
    id:string
  ) {
    await redis.del(
      this.playerKey(id)
    );
  }
}
