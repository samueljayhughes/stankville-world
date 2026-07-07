import { StorageManager } from "../../core/StorageManager";
import { Inventory } from "../../models/Inventory";


export class InventorySystem {

  constructor(
    private storage: StorageManager
  ) {}


  async getInventory(
    playerId: string
  ): Promise<Inventory> {

    return this.storage.getInventory(
      playerId
    );
  }


  async addItem(
    playerId: string,
    itemId: string,
    quantity: number = 1
  ) {

    const inventory =
      await this.storage.getInventory(
        playerId
      );


    const existing =
      inventory.items.find(
        item => item.id === itemId
      );


    if(existing){
      existing.quantity += quantity;
    }
    else {

      if(
        inventory.items.length >=
        inventory.capacity
      ){
        throw new Error(
          "Inventory full"
        );
      }


      inventory.items.push({
        id: itemId,
        quantity
      });
    }


    await this.storage.saveInventory(
      playerId,
      inventory
    );


    return inventory;
  }
}
