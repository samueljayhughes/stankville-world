import { CombatResult } from "../../models/Combat";
import { Enemy } from "../../models/Enemy";

export class CombatSystem {
  /**
   * Player attacks an enemy.
   */
  static playerAttack(
    enemy: Enemy,
    damage: number
  ): CombatResult {
    enemy.currentHealth = Math.max(0, enemy.currentHealth - damage);

    return {
      success: true,
      damage,
      enemyRemainingHealth: enemy.currentHealth,
      defeated: enemy.currentHealth <= 0,
    };
  }

  /**
   * Enemy attacks the player.
   */
  static enemyAttack(
    playerHealth: number,
    damage: number
  ) {
    const remainingHealth = Math.max(0, playerHealth - damage);

    return {
      damage,
      remainingHealth,
      defeated: remainingHealth <= 0,
    };
  }

  /**
   * Basic damage calculation.
   * Can later be expanded with equipment, buffs, crits, etc.
   */
  static calculateDamage(
    attack: number,
    defense: number
  ): number {
    return Math.max(1, attack - defense);
  }
}
