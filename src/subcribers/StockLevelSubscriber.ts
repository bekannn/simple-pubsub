import { IEvent, ISubscriber, Machine, IPublishSubscribeService } from "../models";
import { StockWarningEvent } from "../events/StockWarningEvent";
import { StockLevelOkEvent } from "../events/StockLevelOkEvent";
import { MachineRefillEvent } from "../events/RefillEvent";

export class StockLevelSubscriber implements ISubscriber {
    public machines: Machine[];
    public pubsub: IPublishSubscribeService; // Since this subscriber needs to call publishing
  
    constructor (machines: Machine[], pubsub: IPublishSubscribeService) {
      this.machines = machines; 
      this.pubsub = pubsub
    }

    handle(event: IEvent): void {
        const machine = this.machines.find(m => m.id === event.machineId());
        if (!machine) return;

        if (machine.stockLevel < 3 && !machine.warned) {
            this.pubsub.publish(new StockWarningEvent(machine.id));

            const refillQty = 10 - machine.stockLevel; // when the stock falls below threshold of 3, refill back to full (10)
            this.pubsub.publish(new MachineRefillEvent(refillQty, machine.id));

            machine.warned = true;
            machine.announceOk = false;
        } else if (machine.stockLevel >= 3 && !machine.announceOk) {
            this.pubsub.publish(new StockLevelOkEvent(machine.id));
            
            machine.announceOk = true;
            machine.warned = false;
        }
    }
}