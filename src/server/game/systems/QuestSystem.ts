import { Quest } from "../../models/Quest";
import { QuestRegistry } from "../data/QuestRegistry";

export class QuestSystem {
  /**
   * Look up a quest by ID.
   */
  static getQuest(id: string): Quest | undefined {
    return QuestRegistry.get(id);
  }

  /**
   * Check whether a quest exists.
   */
  static exists(id: string): boolean {
    return QuestRegistry.get(id) !== undefined;
  }

  /**
   * Determine whether a quest is complete.
   * (Placeholder implementation for now.)
   */
  static isComplete(progress: number, required: number): boolean {
    return progress >= required;
  }

  /**
   * Increment quest progress.
   */
  static updateProgress(current: number, amount = 1): number {
    return current + amount;
  }
}
