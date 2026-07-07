import { LootTable } from "../../models/Loot";


export const LootRegistry: Record<string, LootTable> = {

  rat_loot: {

    id: "rat_loot",

    drops: [

      {
        itemId: "apple",
        chance: 0.5,
        quantity: 1
      },

      {
        itemId: "coin",
        chance: 1,
        quantity: 5
      }

    ]

  },


  goblin_loot: {

    id: "goblin_loot",

    drops: [

      {
        itemId: "coin",
        chance: 1,
        quantity: 10
      },

      {
        itemId: "rusty_sword",
        chance: 0.1,
        quantity: 1
      }

    ]

  }

};
