import { EnemyRegistry } from "../data/EnemyRegistry";
import { Enemy } from "../../models/Enemy";


export class EnemySystem {

  static create(enemyId: string): Enemy {

    const template = EnemyRegistry[enemyId];

    if (!template) {
      throw new Error(
        `Unknown enemy: ${enemyId}`
      );
    }

    return {
      ...template,
      currentHealth: template.health,
    };
  }

}
