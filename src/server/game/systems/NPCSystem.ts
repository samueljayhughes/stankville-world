import { NPC } from "../../models/NPC";
import { NPCRegistry } from "../data/NPCRegistry";

export class NPCSystem {
  /**
   * Find an NPC by ID.
   */
  static getNPC(id: string): NPC | undefined {
    return NPCRegistry[id];
  }

  /**
   * Get dialogue for an NPC.
   * Dialogue is not implemented yet.
   */
  static getDialogue(id: string): string[] {
    const npc = NPCRegistry[id];

    if (!npc) {
      return [];
    }

    return [
      npc.description,
    ];
  }

  /**
   * Determine if an NPC can offer a quest.
   * Quest linking is not implemented yet.
   */
  static hasQuest(id: string): boolean {
    const npc = NPCRegistry[id];

    return npc?.type === "quest";
  }

  /**
   * Get the quest offered by an NPC.
   * Quest linking is not implemented yet.
   */
  static getQuest(id: string): string | null {
    const npc = NPCRegistry[id];

    if (npc?.type !== "quest") {
      return null;
    }

    return null;
  }
}
