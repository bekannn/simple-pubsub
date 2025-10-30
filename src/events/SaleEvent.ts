import { IEvent, EventType } from "../models";

export class MachineSaleEvent implements IEvent {
    constructor(private readonly _sold: number, private readonly _machineId: string, private readonly _type: EventType = EventType.SALE) {
      //console.log(`[Event: SALE] At Machine #${this._machineId}, Qty ${_sold}`);
    }
  
    machineId(): string {
      return this._machineId;
    }
  
    getSoldQuantity(): number {
      return this._sold
    }
  
    type(): EventType {
      return this._type;
    }
  
  }