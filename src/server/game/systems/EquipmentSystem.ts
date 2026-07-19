import { Equipment } from "../../models/Equipment";
import type { EquipmentSlot } from "../../models/Item";
import { ItemRegistry } from "../data/ItemRegistry";

export class EquipmentSystem {
  /**
   * Equip an item into the appropriate slot.
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

    equipment[slot] = itemId;

    return true;
  }


  /**
   * Remove an equipped item.
   */
  static unequip(
    equipment: Equipment,
    slot: EquipmentSlot
  ): string | null {
    const equipped = equipment[slot];

    if (!equipped) {
      return null;
    }

    delete equipment[slot];

    return equipped;
  }


  /**
   * Check what item is equipped.
   */
  static getEquipped(
    equipment: Equipment,
    slot: EquipmentSlot
  ): string | null {
    return equipment[slot] ?? null;
  }


  /**
   * Determine whether an item is currently equipped.
   */
  static isEquipped(
    equipment: Equipment,
    itemId: string
  ): boolean {
    return Object.values(equipment).includes(itemId);
  }


  /**
   * Calculate total combat bonuses from equipped items.
   */
  static getTotalStats(
    equipment: Equipment
  ) {
    let attack = 0;
    let defense = 0;
    let health = 0;

    for (const itemId of Object.values(equipment)) {
      if (!itemId) {
        continue;
      }

      const item = ItemRegistry.get(itemId);

      if (!item?.stats) {
        continue;
      }

      attack += item.stats.attack ?? 0;
      defense += item.stats.defense ?? 0;
      health += item.stats.health ?? 0;
    }

    return {
      attack,
      defense,
      health,
    };
  }
}
