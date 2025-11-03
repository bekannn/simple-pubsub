export enum EventType {
    SALE = 'sale',
    REFILL = 'refill',
    LEVEL_WARNING = 'level_warning',
    LEVEL_OK = 'level_Ok'
}

export const STOCK_THRESHOLD: number = 3;
export const STOCK_MAX_LEVEL: number = 10;

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

export interface IMachineRepository {
    getMachineById(id: string): Machine | undefined;
    getAllMachines(): Machine[];
    saveMachine(machine: Machine): void;
    deleteMachine(machine: Machine): void;
}

export class Machine {
    public stockLevel = 10;
    public id: string;
    public warned: boolean = false;
  
    constructor (id: string) {
      this.id = id;
    }

    public soldItem(qty: number): void {
        this.stockLevel = this.stockLevel - qty; // prevent negative stock number
    }

    public refillItem(qty: number): void {
        this.stockLevel = Math.min(this.stockLevel + qty, STOCK_MAX_LEVEL); // prevent overfilling
    }
  
}

