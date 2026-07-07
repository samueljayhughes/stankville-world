export interface Quest {
  id: string;
  name: string;
  description: string;

  requiredLevel: number;

  rewardXP: number;
  rewardItems: string[];
}
