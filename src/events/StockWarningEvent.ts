import { IEvent, EventType } from "../models";

export class StockWarningEvent implements IEvent {
    constructor(private readonly _machineId: string, private readonly _type: EventType = EventType.LEVEL_WARNING) {
        //console.log(`[Announce: Stock WARNING] At Machine #${this._machineId}`);
    };

    machineId(): string {
        return this._machineId;
    }

    type(): EventType {
        return this._type;
    }

    
}