import { ISubscriber, Machine, STOCK_MAX_LEVEL } from "../models";
import { MachineRepository } from "../models/MachineRepository";
import { MachineRefillEvent } from "../events/RefillEvent";

export class MachineRefillSubscriber implements ISubscriber {
    public machines: MachineRepository;
  
    constructor (machines: MachineRepository) {
      this.machines = machines;
    }
  
    handle(event: MachineRefillEvent): void {
      const machine = this.machines.getMachineById(event.machineId());
      if (machine) {
        if (machine.stockLevel !== STOCK_MAX_LEVEL) {
          const refill_number = event.getRefillQuantity();
          machine.refillItem(refill_number);
          console.log(`[REFILL] Machine #${machine.id} refilled ${refill_number} items (remaining: ${machine.stockLevel}).`)
        } else {
          console.log(`[REFILL - FULL] Machine #${machine.id} refill has been canceled (remaining: ${machine.stockLevel}).`)
        }
      }
    }
  }
  
  