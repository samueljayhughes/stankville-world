export interface CombatResult {
  victory: boolean;

  damageDealt: number;
  damageTaken: number;

  xpGained: number;

  lootTable?: string;
}
