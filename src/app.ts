// interfaces
interface IEvent {
  type(): string;
  machineId(): string;
}

interface ISubscriber {
  handle(event: IEvent): void;
}

interface IPublishSubscribeService {
  publish (event: IEvent): void;
  subscribe (type: string, handler: ISubscriber): void;
  //unsubscribe (type: string): void; // Question 2
}

// Question 1
class PublishSubscripeService implements IPublishSubscribeService {
  private events_subscriber: Map<String, ISubscriber[]> = new Map();

  publish(event: IEvent): void {
    const subs = this.events_subscriber.get(event.type()) || [];
    for (const handler of subs) {
      handler.handle(event);
    }
      
  }

  subscribe(type: string, handler: ISubscriber): void {
    const subs = this.events_subscriber.get(type) || [];
    subs.push(handler); // Add new event handler
    this.events_subscriber.set(type, subs); // Set the new handler array
  }

}

// implementations
class MachineSaleEvent implements IEvent {
  constructor(private readonly _sold: number, private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  getSoldQuantity(): number {
    return this._sold
  }

  type(): string {
    return 'sale';
  }
}

class MachineRefillEvent implements IEvent {
  constructor(private readonly _refill: number, private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  getReFillQuantity(): number {
    return this._refill;
  }

  type(): string {
    return 'refill';
  }
}

class MachineSaleSubscriber implements ISubscriber {
  public machines: Machine[];

  constructor (machines: Machine[]) {
    this.machines = machines; 
  }

  handle(event: MachineSaleEvent): void {
    const machine = this.machines.find(m => m.id === event.machineId());
    if (machine) {
      const sold_number = event.getSoldQuantity();
      machine.stockLevel -= sold_number;
      console.log(`[Sale] There was ${sold_number} item solds for machine #${machine.id}.`)
    }
  }
}

// Question 3
class MachineRefillSubscriber implements ISubscriber {
  public machines: Machine[];

  constructor (machines: Machine[]) {
    this.machines = machines;
  }

  handle(event: MachineRefillEvent): void {
    const machine = this.machines.find(m => m.id === event.machineId());
    if (machine) {
      const refill_number = event.getReFillQuantity();
      machine.stockLevel += refill_number;
      console.log(`[Refill] There was ${refill_number} item refilled to machine #${machine.id}.`)
    }
  }
}


// objects
class Machine {
  public stockLevel = 10;
  public id: string;

  constructor (id: string) {
    this.id = id;
  }
}


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
    const saleQty = Math.random() < 0.5 ? 1 : 2; // 1 or 2
    console.log('new SALE event')
    return new MachineSaleEvent(saleQty, randomMachine());
  } 
  const refillQty = Math.random() < 0.5 ? 3 : 5; // 3 or 5
  console.log('new REFILL event')
  return new MachineRefillEvent(refillQty, randomMachine());
}


// program
(async () => {
  // create 3 machines with a quantity of 10 stock
  const machines: Machine[] = [ new Machine('001'), new Machine('002'), new Machine('003') ];

  // create a machine sale event subscriber. inject the machines (all subscribers should do this)
  const saleSubscriber = new MachineSaleSubscriber(machines);

  const refillSubscriber = new MachineRefillSubscriber(machines);

  // create the PubSub service
  const pubSubService: IPublishSubscribeService = new PublishSubscripeService(); // implement and fix this

  pubSubService.subscribe('sale', saleSubscriber);
  pubSubService.subscribe('refill', refillSubscriber);

  // create 5 random events
  const events = [1,2,3,4,5].map(i => eventGenerator());

  // publish the events
  events.map(events => pubSubService.publish(events));
})();
