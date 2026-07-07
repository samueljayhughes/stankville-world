import { NPC } from "../../models/NPC";


export const NPCRegistry: Record<string, NPC> = {

  mayor_stank: {
    id: "mayor_stank",

    name: "Mayor Stank",

    type: "quest",

    description:
      "The mayor of Stankville who needs help protecting the town."
  },


  old_merchant: {
    id: "old_merchant",

    name: "Old Merchant",

    type: "merchant",

    description:
      "A traveling merchant selling unusual goods."
  }

};
