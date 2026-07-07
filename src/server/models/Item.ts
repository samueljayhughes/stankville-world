export type ItemType =
  | "weapon"
  | "armor"
  | "consumable"
  | "material"
  | "quest"
  | "currency";

export type ItemRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
  stackable: boolean;
}
