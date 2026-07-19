import { Item } from "../../models/Item";
import { ItemRegistry } from "../data/ItemRegistry";

export class ItemSystem {
  static getItem(id: string): Item | undefined {
    return ItemRegistry.get(id);
  }

  static exists(id: string): boolean {
    return ItemRegistry.has(id);
  }

  static isStackable(id: string): boolean {
    const item = this.getItem(id);
    return item?.stackable ?? false;
  }

  static getValue(id: string): number {
    return this.getItem(id)?.value ?? 0;
  }

  static getAllItems(): Item[] {
    return ItemRegistry.all();
  }
}
