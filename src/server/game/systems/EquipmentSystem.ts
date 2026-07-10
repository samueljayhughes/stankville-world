import { Equipment, EquipmentSlot } from "../../models/Equipment";
import { ItemRegistry } from "../data/ItemRegistry";

export class EquipmentSystem {
  /**
   * Equip an item into the appropriate slot.
   * Returns true if successful.
   */
  static equip(
    equipment: Equipment,
    itemId: string
  ): boolean {
    const item = ItemRegistry.get(itemId);

    if (!item) {
      return false;
    }

    if (!item.slot) {
      return false;
    }

    const slot = item.slot as EquipmentSlot;

    equipment.slots[slot] = itemId;

    return true;
  }

  /**
   * Remove an equipped item.
   */
  static unequip(
    equipment: Equipment,
    slot: EquipmentSlot
  ): string | null {
    const equipped = equipment.slots[slot];

    if (!equipped) {
      return null;
    }

    equipment.slots[slot] = null;

    return equipped;
  }

  /**
   * Check what item is equipped.
   */
  static getEquipped(
    equipment: Equipment,
    slot: EquipmentSlot
  ): string | null {
    return equipment.slots[slot];
  }

  /**
   * Determine whether an item is currently equipped.
   */
  static isEquipped(
    equipment: Equipment,
    itemId: string
  ): boolean {
    return Object.values(equipment.slots).includes(itemId);
  }
}
