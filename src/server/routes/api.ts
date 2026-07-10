import { Hono } from "hono";
import { context } from "@devvit/web/server";
import type { InitResponse } from "../../shared/api";

import { GameEngine } from "../game/engine/GameEngine";
import { EnemyFactory } from "../game/services/EnemyFactory";
import { StorageManager } from "../core/StorageManager";

import { CombatSystem } from "../game/systems/CombatSystem";


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
        status:"error",
        message:"Missing postId or userId from context",
      },
      400
    );
  }


  try {

    const [profile, stats, inventory, world] =
      await Promise.all([
        engine.getPlayerProfile(userId),
        engine.getPlayerStats(userId),
        engine.getInventory(userId),
        engine.getWorldState(),
      ]);


    if (!profile) {

      await engine.setPlayerProfile(
        userId,
        {
          userId,
          createdAt:Date.now(),
          name:`Wanderer-${userId.slice(0,5)}`,
        }
      );

    }


    const response: InitResponse = {

      type:"init",

      postId,

      username:userId,

      profile:profile ?? {

        userId,

        createdAt:Date.now(),

        name:`Wanderer-${userId.slice(0,5)}`,

      },

      stats,

      inventory,

      world,

    } as any;


    return c.json(response);


  } catch(err) {

    return c.json<ErrorResponse>(
      {
        status:"error",
        message:
          err instanceof Error
          ? err.message
          :"Unknown error",
      },
      500
    );

  }

});



/**
 * ADD XP TEST
 */
api.post("/xp/add", async (c)=>{

  const { userId } = context;


  if(!userId){

    return c.json<ErrorResponse>(
      {
        status:"error",
        message:"Missing userId",
      },
      400
    );

  }


  const body =
    await c.req.json<{amount:number}>();


  const stats =
    await engine.addXP(
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
api.get("/world", async(c)=>{

  const world =
    await engine.getWorldState();


  return c.json({

    type:"world",

    world,

  });

});



/**
 * EXPLORE
 */
api.post("/explore", async(c)=>{

  const { userId } = context;


  if(!userId){

    return c.json<ErrorResponse>(
      {
        status:"error",
        message:"Missing userId",
      },
      400
    );

  }


  const encounter =
    engine.explore();


  return c.json({

    type:"exploration",

    encounter,

  });

});



/**
 * START COMBAT
 */
api.post("/combat/start", async(c)=>{

  const { userId } = context;


  if(!userId){

    return c.json<ErrorResponse>(
      {
        status:"error",
        message:"Missing userId",
      },
      400
    );

  }


  try {

    const body =
      await c.req.json<{
        enemyId:string;
      }>();


    const enemy =
      EnemyFactory.create(
        body.enemyId
      );


    const session = {

      id:crypto.randomUUID(),

      playerId:userId,

      enemy,

      playerHealth:100,

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


  } catch(err){

    return c.json<ErrorResponse>(
      {
        status:"error",
        message:
          err instanceof Error
          ? err.message
          :"Unknown error",
      },
      500
    );

  }

});



/**
 * COMBAT ATTACK
 */
api.post("/combat/attack", async(c)=>{

  const { userId } = context;


  if(!userId){

    return c.json<ErrorResponse>(
      {
        status:"error",
        message:"Missing userId",
      },
      400
    );

  }


  try {

    const body =
      await c.req.json<{
        sessionId:string;
      }>();


    const session =
      await StorageManager.getCombatSession(
        body.sessionId
      );


    if(!session){

      return c.json<ErrorResponse>(
        {
          status:"error",
          message:"Combat session not found",
        },
        404
      );

    }



    if(session.playerId !== userId){

      return c.json<ErrorResponse>(
        {
          status:"error",
          message:"Invalid combat session",
        },
        403
      );

    }



    const playerDamage =
      CombatSystem.calculateDamage(
        10,
        session.enemy.defense
      );


    const playerResult =
      CombatSystem.playerAttack(
        session.enemy,
        playerDamage
      );



    if(playerResult.defeated){

      const stats =
        await engine.addXP(
          userId,
          session.enemy.xpReward
        );


      await StorageManager.deleteCombatSession(
        session.id
      );


      return c.json({

        type:"combat_victory",

        damage:playerDamage,

        xp:session.enemy.xpReward,

        loot:session.enemy.lootTable,

        stats,

      });

    }



    const enemyResult =
      CombatSystem.enemyAttack(
        session.playerHealth,
        session.enemy.attack
      );


    session.playerHealth =
      enemyResult.remainingHealth;


    session.turn++;


    if(enemyResult.defeated){

      await StorageManager.deleteCombatSession(
        session.id
      );


      return c.json({

        type:"combat_defeat",

        playerHealth:0,

      });

    }



    await StorageManager.setCombatSession(
      session
    );


    return c.json({

      type:"combat_turn",

      playerDamage,

      enemyDamage:
        enemyResult.damage,

      enemyHealth:
        session.enemy.currentHealth,

      playerHealth:
        session.playerHealth,

      turn:
        session.turn,

    });



  } catch(err){

    return c.json<ErrorResponse>(
      {
        status:"error",
        message:
          err instanceof Error
          ? err.message
          :"Unknown error",
      },
      500
    );

  }

});
