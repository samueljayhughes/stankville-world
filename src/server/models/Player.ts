export interface Player {
  id: string;
  username: string;

  level: number;
  xp: number;
  gold: number;

  createdAt: number;
  lastLogin: number;
}
