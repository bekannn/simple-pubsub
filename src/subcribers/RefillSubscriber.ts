import { ISubscriber, Machine } from "../models";
import { MachineRefillEvent } from "../events/RefillEvent";

export class MachineRefillSubscriber implements ISubscriber {
    public machines: Machine[];
  
    constructor (machines: Machine[]) {
      this.machines = machines;
    }
  
    handle(event: MachineRefillEvent): void {
      const machine = this.machines.find(m => m.id === event.machineId());
      if (machine) {
        const refill_number = event.getRefillQuantity();
        machine.refillItem(refill_number);
        console.log(`[Handled: REFILL] Machine #${machine.id} refilled ${refill_number} items (remaining total: ${machine.stockLevel}).`)
      }
    }
  }
  
  