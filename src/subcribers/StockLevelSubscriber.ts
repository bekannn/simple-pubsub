import { IEvent, ISubscriber, Machine, IPublishSubscribeService, STOCK_THRESHOLD } from "../models";
import { StockWarningEvent } from "../events/StockWarningEvent";
import { StockLevelOkEvent } from "../events/StockLevelOkEvent";
import { MachineRefillEvent } from "../events/RefillEvent";
import { MachineRepository } from "../models/MachineRepository";

export class StockLevelSubscriber implements ISubscriber {
    public machines: MachineRepository;
    public pubsub: IPublishSubscribeService; // Since this subscriber needs to call publishing
  
    constructor (machines: MachineRepository, pubsub: IPublishSubscribeService) {
      this.machines = machines; 
      this.pubsub = pubsub
    }

    handle(event: IEvent): void {
        const machine = this.machines.getMachineById(event.machineId());
        if (!machine) return;

        if (machine.stockLevel < STOCK_THRESHOLD && !machine.warned) {
            this.pubsub.publish(new StockWarningEvent(machine.id));

            const refillQty = 10 - machine.stockLevel; // when the stock falls below threshold of 3, refill back to full (10)
            this.pubsub.publish(new MachineRefillEvent(refillQty, machine.id));

            machine.warned = true;
            machine.announceOk = false;
        } else if (machine.stockLevel >= STOCK_THRESHOLD && !machine.announceOk) {
            this.pubsub.publish(new StockLevelOkEvent(machine.id));

            machine.announceOk = true;
            machine.warned = false;
        }
    }
}