import { Hono } from "hono";
import { context } from "@devvit/web/server";
import type { InitResponse } from "../../shared/api";
import { GameEngine } from "../game/engine/GameEngine";
import { EnemyFactory } from "../game/services/EnemyFactory";
import { StorageManager } from "../core/StorageManager";


type ErrorResponse = {
  status: "error";
  message: string;
};


export const api = new Hono();

const engine = GameEngine.get();


/**
 * INIT
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


/**
 * ADD XP TEST
 */
api.post("/xp/add", async (c) => {

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


  const body = await c.req.json<{ amount:number }>();

  const stats = await engine.addXP(
    userId,
    body.amount
  );


  return c.json({
    type:"xp_update",
    stats,
  });

});


/**
 * WORLD
 */
api.get("/world", async (c) => {

  const world = await engine.getWorldState();

  return c.json({
    type:"world",
    world,
  });

});


/**
 * EXPLORE
 */
api.post("/explore", async (c) => {

  const { userId } = context;


  if (!userId) {
    return c.json<ErrorResponse>(
      {
        status:"error",
        message:"Missing userId",
      },
      400
    );
  }


  const encounter = engine.explore();


  return c.json({
    type:"exploration",
    encounter,
  });

});


/**
 * START COMBAT
 */
api.post("/combat/start", async (c) => {

  const { userId } = context;


  if (!userId) {
    return c.json<ErrorResponse>(
      {
        status:"error",
        message:"Missing userId",
      },
      400
    );
  }


  try {

    const body = await c.req.json<{
      enemyId:string;
    }>();


    const enemy = EnemyFactory.create(
      body.enemyId
    );


    const session = {
      id: crypto.randomUUID(),

      playerId:userId,

      enemy,

      turn:1,

      startedAt:Date.now(),
    };


    await StorageManager.setCombatSession(
      session
    );


    return c.json({
      type:"combat_started",
      session,
    });


  } catch(err) {

    return c.json<ErrorResponse>(
      {
        status:"error",
        message: err instanceof Error
          ? err.message
          : "Unknown error",
      },
      500
    );

  }

});
