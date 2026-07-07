import { Quest } from "../../models/Quest";


export const QuestRegistry: Record<string, Quest> = {

  clear_sewers: {

    id: "clear_sewers",

    name: "Clear the Sewers",

    description:
      "Defeat sewer rats threatening Stankville.",

    requiredLevel: 1,

    rewardXP: 50,

    rewardItems: [
      "coin"
    ]
  }

};
