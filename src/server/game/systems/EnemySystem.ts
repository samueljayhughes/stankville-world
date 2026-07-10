import { Enemy } from "../../models/Enemy";
import { EnemyFactory } from "../services/EnemyFactory";


export class EnemySystem {

  static create(enemyId: string): Enemy {

    return EnemyFactory.create(enemyId);

  }

}
