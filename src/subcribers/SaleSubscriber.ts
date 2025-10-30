import { ISubscriber, Machine, IPublishSubscribeService, EventType } from "../models";
import { MachineSaleEvent } from "../events/SaleEvent";
import { StockWarningEvent } from "../events/StockWarningEvent";
import { PublishSubscribeService } from "../services/PublishSubscribeService";

export class MachineSaleSubscriber implements ISubscriber {
    public machines: Machine[];
  
    constructor (machines: Machine[]) {
      this.machines = machines; 
    }
  
    handle(event: MachineSaleEvent): void {
      const machine = this.machines.find(m => m.id === event.machineId());
      if (machine) {
        const soldNumber = event.getSoldQuantity();
        machine.soldItem(soldNumber);
        console.log(`[Handled: SALE] Machine #${machine.id} sold ${soldNumber} items (remaining total: ${machine.stockLevel}).`)
      }
    }
  }