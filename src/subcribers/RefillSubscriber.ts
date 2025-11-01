import { ISubscriber, Machine } from "../models";
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
        const refill_number = event.getRefillQuantity();
        machine.refillItem(refill_number);
        console.log(`[HANDLED: refill] Machine #${machine.id} refilled ${refill_number} items (remaining total: ${machine.stockLevel}).`)
      }
    }
  }
  
  