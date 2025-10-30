import { IEvent, EventType } from "../models";

export class MachineRefillEvent implements IEvent {
    constructor(private readonly _refill: number, private readonly _machineId: string, private readonly _type: EventType = EventType.REFILL) {
      //console.log(`[Event: REFILL] At Machine #${this._machineId}, Qty ${_refill}`);
    }
  
    machineId(): string {
      return this._machineId;
    }
  
    getRefillQuantity(): number {
      return this._refill;
    }
  
    type(): EventType {
      return this._type ;
    }
  }
  