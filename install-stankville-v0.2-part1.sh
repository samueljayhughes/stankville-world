#!/bin/bash

set -e

echo "Installing Stankville v0.2 Part 1..."

mkdir -p src/server/models
mkdir -p src/server/game/data

echo "Creating models..."

cat > src/server/models/Enemy.ts <<'EOF'
export interface Enemy {
  id: string;
  name: string;
  level: number;

  health: number;
  attack: number;
  defense: number;

  xpReward: number;
  lootTable: string;
}
EOF


cat > src/server/models/NPC.ts <<'EOF'
export interface NPC {
  id: string;
  name: string;

  type:
    | "merchant"
    | "quest"
    | "trainer"
    | "citizen";

  description: string;
}
EOF


cat > src/server/models/Quest.ts <<'EOF'
export interface Quest {
  id: string;
  name: string;
  description: string;

  requiredLevel: number;

  rewardXP: number;
  rewardItems: string[];
}
EOF


cat > src/server/models/Combat.ts <<'EOF'
export interface CombatResult {
  victory: boolean;

  damageDealt: number;
  damageTaken: number;

  xpGained: number;

  lootTable?: string;
}
EOF


cat > src/server/models/Loot.ts <<'EOF'
export interface LootEntry {
  itemId: string;
  chance: number;
  quantity: number;
}


export interface LootTable {
  id: string;
  drops: LootEntry[];
}
EOF


echo "Updating equipment model..."

cat > src/server/models/Equipment.ts <<'EOF'
export interface Equipment {

  weapon?: string;

  helmet?: string;

  chest?: string;

  legs?: string;

  boots?: string;

  offhand?: string;
}
EOF


echo "Creating enemy registry..."

cat > src/server/game/data/EnemyRegistry.ts <<'EOF'
import { Enemy } from "../../models/Enemy";


export const EnemyRegistry: Record<string, Enemy> = {

  sewer_rat: {
    id: "sewer_rat",
    name: "Sewer Rat",

    level: 1,

    health: 20,
    attack: 5,
    defense: 1,

    xpReward: 10,

    lootTable: "rat_loot"
  },


  trash_goblin: {
    id: "trash_goblin",
    name: "Trash Goblin",

    level: 2,

    health: 50,
    attack: 10,
    defense: 3,

    xpReward: 25,

    lootTable: "goblin_loot"
  }

};
EOF


echo "Creating NPC registry..."

cat > src/server/game/data/NPCRegistry.ts <<'EOF'
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
EOF


echo "Creating quest registry..."

cat > src/server/game/data/QuestRegistry.ts <<'EOF'
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
EOF


echo "Creating loot registry..."

cat > src/server/game/data/LootRegistry.ts <<'EOF'
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
EOF


echo "v0.2 Part 1 complete."
