import { Enemy } from "../../models/Enemy";


export interface CombatSession {

  id: string;

  playerId: string;

  enemy: Enemy;

  turn: number;

  startedAt: number;

}
