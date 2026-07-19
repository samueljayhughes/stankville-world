import { StorageManager } from "../../core/StorageManager";
import { Inventory } from "../../models/Inventory";

export class InventorySystem {
  static async getInventory(playerId: string): Promise<Inventory> {
    return StorageManager.getInventory(playerId);
  }

  static async addItem(playerId: string, itemId: string, quantity: number = 1): Promise<Inventory> {
    const inventory = await StorageManager.getInventory(playerId);
    const existing = inventory.items.find((item) => item.id === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      if (inventory.items.length >= inventory.capacity) {
        throw new Error("Inventory full");
      }
      inventory.items.push({ id: itemId, quantity });
    }
    await StorageManager.setInventory(playerId, inventory);
    return inventory;
  }

  static async removeItem(playerId: string, itemId: string, quantity: number = 1): Promise<Inventory> {
    const inventory = await StorageManager.getInventory(playerId);
    const idx = inventory.items.findIndex((item) => item.id === itemId);
    if (idx === -1) return inventory;
    const item = inventory.items[idx];
    if (!item) return inventory;
    item.quantity -= quantity;
    if (item.quantity <= 0) {
      inventory.items.splice(idx, 1);
    }
    await StorageManager.setInventory(playerId, inventory);
    return inventory;
  }

  static async hasItem(playerId: string, itemId: string, quantity: number = 1): Promise<boolean> {
    const inventory = await StorageManager.getInventory(playerId);
    const item = inventory.items.find((i) => i.id === itemId);
    return (item?.quantity ?? 0) >= quantity;
  }
}
