import type { EquipmentSlot } from "./Item";

export interface Equipment {
  weapon?: string;

  helmet?: string;

  chest?: string;

  legs?: string;

  boots?: string;

  offhand?: string;
}

export const EquipmentSlots: EquipmentSlot[] = [
  "weapon",
  "helmet",
  "chest",
  "legs",
  "boots",
  "offhand",
];
