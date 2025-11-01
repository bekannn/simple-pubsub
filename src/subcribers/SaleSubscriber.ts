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
        const soldNumber = event.getSoldQuantity();
        machine.soldItem(soldNumber);
        console.log(`[HANDLED: sale] Machine #${machine.id} sold ${soldNumber} items (remaining total: ${machine.stockLevel}).`)
      }
    }
  }