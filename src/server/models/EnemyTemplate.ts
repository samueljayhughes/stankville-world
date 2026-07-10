export interface EnemyTemplate {
  id: string;
  name: string;
  level: number;

  health: number;

  attack: number;
  defense: number;

  xpReward: number;
  lootTable: string;
}
