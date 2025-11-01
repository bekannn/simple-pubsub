import { Machine, IEvent, IPublishSubscribeService, EventType } from "./models";
import { MachineSaleEvent } from "./events/SaleEvent";
import { MachineRefillEvent } from "./events/RefillEvent";
import { MachineSaleSubscriber } from "./subcribers/SaleSubscriber";
import { MachineRefillSubscriber } from "./subcribers/RefillSubscriber";
import { PublishSubscribeService } from "./services/PublishSubscribeService";
import { StockLevelSubscriber } from "./subcribers/StockLevelSubscriber";
import { MachineRepository } from "./models/MachineRepository";

// helpers
const randomMachine = (): string => {
  const random = Math.random() * 3;
  if (random < 1) {
    return '001';
  } else if (random < 2) {
    return '002';
  }
  return '003';

}

const eventGenerator = (): IEvent => {
  const random = Math.random();
  if (random < 0.5) {
    const saleQty = Math.random() < 0.5 ? 8 : 4; 
    //console.log(`[SALE] New event: Quantity ${saleQty}`);
    return new MachineSaleEvent(saleQty, randomMachine());
  } 
  const refillQty = Math.random() < 0.5 ? 1 : 2; 
  //console.log(`[REFILL] New event: Quantity ${refillQty}`)
  return new MachineRefillEvent(refillQty, randomMachine());
}


// program
( () => {
  // create 3 machines with a quantity of 10 stock
  const machineRepository = new MachineRepository();
  machineRepository.saveMachine(new Machine('001'));
  machineRepository.saveMachine(new Machine('002'));
  machineRepository.saveMachine(new Machine('003'));

  // create the PubSub service
  const pubSubService: IPublishSubscribeService = new PublishSubscribeService(); 

  // create a machine sale event subscriber. inject the machines (all subscribers should do this)
  const saleSubscriber = new MachineSaleSubscriber(machineRepository);

  const refillSubscriber = new MachineRefillSubscriber(machineRepository);

  const stockSubscriber = new StockLevelSubscriber(machineRepository, pubSubService);

 
  pubSubService.subscribe(EventType.SALE, saleSubscriber);
  pubSubService.subscribe(EventType.REFILL, refillSubscriber);
  pubSubService.subscribe(EventType.SALE, stockSubscriber);
  pubSubService.subscribe(EventType.REFILL, stockSubscriber);

  pubSubService.subscribe(EventType.REFILL, refillSubscriber);


  // create random events
  const events = [1,2,3,4].map(i => eventGenerator());

  // publish the events
  events.map(pubSubService.publish);

  // try unsubscribing
  //pubSubService.unsubscribe(EventType.REFILL, refillSubscriber);

  // create random events
  const events2 = [1,2,3,4,5].map(i => eventGenerator());

  // publish the events (there should be no refill handler events here)
  events2.map(pubSubService.publish);

})();
