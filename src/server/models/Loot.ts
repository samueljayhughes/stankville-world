export interface LootEntry {
  itemId: string;
  chance: number;
  quantity: number;
}


export interface LootTable {
  id: string;
  drops: LootEntry[];
}
