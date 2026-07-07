import { Item } from "../../models/Item";
import { ItemRegistry } from "../data/ItemRegistry";

export class ItemSystem {

  /**
   * Returns an item definition by ID.
   */
  static getItem(id: string): Item | undefined {
    return ItemRegistry[id];
  }

  /**
   * Returns true if the item exists.
   */
  static exists(id: string): boolean {
    return id in ItemRegistry;
  }

  /**
   * Returns whether an item can stack.
   */
  static isStackable(id: string): boolean {
    const item = this.getItem(id);
    return item?.stackable ?? false;
  }

  /**
   * Returns an item's value.
   */
  static getValue(id: string): number {
    return this.getItem(id)?.value ?? 0;
  }

  /**
   * Returns all registered items.
   */
  static getAllItems(): Item[] {
    return Object.values(ItemRegistry);
  }
}
