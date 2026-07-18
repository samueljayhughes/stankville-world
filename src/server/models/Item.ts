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

export type EquipmentSlot =
  | "weapon"
  | "helmet"
  | "chest"
  | "legs"
  | "boots"
  | "offhand";

export interface ItemStats {
  attack?: number;
  defense?: number;
  health?: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;

  type: ItemType;
  rarity: ItemRarity;

  value: number;
  stackable: boolean;

  /**
   * Present only if this item can be equipped.
   */
  slot?: EquipmentSlot;

  /**
   * Stat bonuses granted while equipped.
   */
  stats?: ItemStats;
}
