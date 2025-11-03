import { IEvent, ISubscriber, Machine, IPublishSubscribeService, STOCK_THRESHOLD } from "../models";
import { MachineRefillEvent } from "../events/RefillEvent";
import { MachineRepository } from "../models/MachineRepository";

export class LowStockWarningSubscriber implements ISubscriber {
    public machines: MachineRepository;
    public pubsub: IPublishSubscribeService; // Since this subscriber needs to call publishing
  
    constructor (machines: MachineRepository, pubsub: IPublishSubscribeService) {
      this.machines = machines; 
      this.pubsub = pubsub
    }

    handle(event: IEvent): void {
        const machine = this.machines.getMachineById(event.machineId());
        if (!machine) return;

        if (machine.stockLevel < STOCK_THRESHOLD) {
            // when the stock falls below threshold of 3, refill back to full (10)
            const refillQty = 10 - machine.stockLevel; 
            this.pubsub.publish(new MachineRefillEvent(refillQty, machine.id));
        } 
    }
}