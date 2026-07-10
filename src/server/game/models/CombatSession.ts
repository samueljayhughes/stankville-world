import { Enemy } from "../../models/Enemy";

export interface CombatSession {

  id: string;

  playerId: string;

  enemy: Enemy;

  playerHealth: number;

  turn: number;

  startedAt: number;

}
