import { Hono } from "hono";
import { context } from "@devvit/web/server";
import type { InitResponse } from "../../shared/api";
import { GameEngine } from "../game/engine/GameEngine";

type ErrorResponse = {
  status: "error";
  message: string;
};

export const api = new Hono();

const engine = GameEngine.get();

/**
 * INIT
 * Called when client loads the game
 * Returns player + world snapshot
 */
api.get("/init", async (c) => {
  const { postId, userId } = context;

  if (!postId || !userId) {
    return c.json<ErrorResponse>(
      {
        status: "error",
        message: "Missing postId or userId from context",
      },
      400
    );
  }

  try {
    const [profile, stats, inventory, world] = await Promise.all([
      engine.getPlayerProfile(userId),
      engine.getPlayerStats(userId),
      engine.getInventory(userId),
      engine.getWorldState(),
    ]);

    // Create new player if none exists
    if (!profile) {
      await engine.setPlayerProfile(userId, {
        userId,
        createdAt: Date.now(),
        name: `Wanderer-${userId.slice(0, 5)}`,
      });
    }

    const response: InitResponse = {
      type: "init",
      postId,
      username: userId,
      profile: profile ?? {
        userId,
        createdAt: Date.now(),
        name: `Wanderer-${userId.slice(0, 5)}`,
      },
      stats,
      inventory,
      world,
    } as any;

    return c.json(response);
  } catch (err) {
    console.error("Init error:", err);

    return c.json<ErrorResponse>(
      {
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      500
    );
  }
});

/**
 * XP TEST ENDPOINT
 * temporary until client UI is built
 */
api.post("/xp/add", async (c) => {
  const { userId } = context;

  if (!userId) {
    return c.json<ErrorResponse>(
      { status: "error", message: "Missing userId" },
      400
    );
  }

  const body = await c.req.json<{ amount: number }>();

  const stats = await engine.addXP(userId, body.amount);

  return c.json({
    type: "xp_update",
    stats,
  });
});

/**
 * WORLD STATE
 */
api.get("/world", async (c) => {
  const world = await engine.getWorldState();

  return c.json({
    type: "world",
    world,
  });
});

/**
 * EXPLORE
 * Player explores Stankville
 */
api.post("/explore", async (c) => {
  const { userId } = context;

  if (!userId) {
    return c.json<ErrorResponse>(
      {
        status: "error",
        message: "Missing userId",
      },
      400
    );
  }

  try {
    const encounter = engine.explore();

    return c.json({
      type: "exploration",
      encounter,
    });

  } catch (err) {
    console.error("Explore error:", err);

    return c.json<ErrorResponse>(
      {
        status: "error",
        message: err instanceof Error
          ? err.message
          : "Unknown error",
      },
      500
    );
  }
});
