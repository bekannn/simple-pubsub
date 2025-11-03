import { ISubscriber, Machine} from "../models";
import { MachineRepository } from "../models/MachineRepository";
import { MachineSaleEvent } from "../events/SaleEvent";

export class MachineSaleSubscriber implements ISubscriber {
    public machines: MachineRepository;
  
    constructor (machines: MachineRepository) {
      this.machines = machines; 
    }
  
    handle(event: MachineSaleEvent): void {
      const machine = this.machines.getMachineById(event.machineId());
      if (machine) {
        const requestedSaleNumber = event.getSoldQuantity();
        const actualSaleNumber = Math.min(machine.stockLevel, requestedSaleNumber);
        machine.soldItem(actualSaleNumber);

        if (requestedSaleNumber === actualSaleNumber) {
          console.log(`[SALE] Machine #${machine.id} sold ${requestedSaleNumber} items (remaining: ${machine.stockLevel}).`)
        } else {
          console.log(`[SALE - UNFULFILLED] Machine #${machine.id} sold ${actualSaleNumber} items from ${requestedSaleNumber} requested (remaining: ${machine.stockLevel}).`)
        }
      }
    }
  }