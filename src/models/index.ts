export enum EventType {
    SALE = 'sale',
    REFILL = 'refill',
    LEVEL_WARNING = 'level_warning',
    LEVEL_OK = 'level_Ok'
}

export interface IEvent {
    type(): EventType;
    machineId(): string;
}
  
export interface ISubscriber {
    handle(event: IEvent): void;
}
  
export interface IPublishSubscribeService {
    publish (event: IEvent): void;
    subscribe (type: EventType, handler: ISubscriber): void;
    unsubscribe (type: EventType, handler: ISubscriber): void; // Question 2
}

export class Machine {
    public stockLevel = 10;
    public id: string;
    public warned: boolean = false;
    public announceOk: boolean = false;
  
    constructor (id: string) {
      this.id = id;
    }

    public soldItem(qty: number): void {
        this.stockLevel = Math.max(this.stockLevel - qty, 0); // prevent negative stock number
    }

    public refillItem(qty: number): void {
        this.stockLevel += qty;
    }
  
}

