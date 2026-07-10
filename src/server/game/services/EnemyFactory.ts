import { Enemy } from "../../models/Enemy";
import { EnemyRegistry } from "../data/EnemyRegistry";


export class EnemyFactory {

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
