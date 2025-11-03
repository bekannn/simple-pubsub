import { IEvent, ISubscriber, Machine, IPublishSubscribeService, STOCK_THRESHOLD } from "../models";
import { StockWarningEvent } from "../events/StockWarningEvent";
import { StockLevelOkEvent } from "../events/StockLevelOkEvent";
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
            console.log(`[WARNING] Machine #${machine.id} stock level dropped to ${machine.stockLevel}!`);
            this.pubsub.publish(new StockWarningEvent(machine.id));

            machine.warned = true;
        } else if (machine.stockLevel >= STOCK_THRESHOLD && machine.warned) {
            console.log(`[OK] Machine #${machine.id} stock level is ${machine.stockLevel}.`);
            this.pubsub.publish(new StockLevelOkEvent(machine.id));

            machine.warned = false;
        }
    }
}