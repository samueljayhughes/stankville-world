import { Item } from "../../models/Item";

export const ItemRegistry: Record<string, Item> = {

  coin: {
    id: "coin",
    name: "Coin",
    description: "Standard currency of Stankville.",
    type: "currency",
    rarity: "common",
    value: 1,
    stackable: true,
  },

  apple: {
    id: "apple",
    name: "Apple",
    description: "Restores a little health.",
    type: "consumable",
    rarity: "common",
    value: 2,
    stackable: true,
  },

  rusty_sword: {
    id: "rusty_sword",
    name: "Rusty Sword",
    description: "Old, worn, but still usable.",
    type: "weapon",
    rarity: "common",
    value: 10,
    stackable: false,
  },

  wooden_shield: {
    id: "wooden_shield",
    name: "Wooden Shield",
    description: "Offers basic protection.",
    type: "armor",
    rarity: "common",
    value: 8,
    stackable: false,
  }

};
