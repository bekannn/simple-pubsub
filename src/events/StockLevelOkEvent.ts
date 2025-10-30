import { IEvent, EventType } from "../models";

export class StockLevelOkEvent implements IEvent {
    constructor(private readonly _machineId: string, private readonly _type: EventType = EventType.LEVEL_OK) {
        //console.log(`[Announce: Stock OK] At Machine #${this._machineId}`);
    };

    machineId(): string {
        return this._machineId;
    }

    type(): EventType {
        return this._type;
    }

    
}