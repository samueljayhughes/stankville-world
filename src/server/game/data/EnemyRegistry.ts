import { Enemy } from "../../models/Enemy";


const createEnemy = (
  enemy: Omit<Enemy, "currentHealth">
): Enemy => ({
  ...enemy,
  currentHealth: enemy.health,
});


export const EnemyRegistry: Record<string, Enemy> = {

  sewer_rat: createEnemy({
    id: "sewer_rat",
    name: "Sewer Rat",

    level: 1,

    health: 20,
    attack: 5,
    defense: 1,

    xpReward: 10,

    lootTable: "rat_loot",
  }),


  trash_goblin: createEnemy({
    id: "trash_goblin",
    name: "Trash Goblin",

    level: 2,

    health: 50,
    attack: 10,
    defense: 3,

    xpReward: 25,

    lootTable: "goblin_loot",
  }),

};
