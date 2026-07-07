export interface InventoryItem {
  id: string;
  quantity: number;
}

export interface Inventory {
  capacity: number;
  items: InventoryItem[];
}
