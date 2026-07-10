import { NPC } from "../../models/NPC";
import { NPCRegistry } from "../data/NPCRegistry";

export class NPCSystem {
  /**
   * Find an NPC by ID.
   */
  static getNPC(id: string): NPC | undefined {
    return NPCRegistry.get(id);
  }

  /**
   * Get dialogue for an NPC.
   */
  static getDialogue(id: string): string[] {
    const npc = NPCRegistry.get(id);

    if (!npc) {
      return [];
    }

    return npc.dialogue;
  }

  /**
   * Determine if an NPC can offer a quest.
   */
  static hasQuest(id: string): boolean {
    const npc = NPCRegistry.get(id);

    return !!npc?.questId;
  }

  /**
   * Get the quest offered by an NPC.
   */
  static getQuest(id: string): string | null {
    const npc = NPCRegistry.get(id);

    return npc?.questId ?? null;
  }
}
