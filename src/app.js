"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// implementations
class MachineSaleEvent {
    _sold;
    _machineId;
    constructor(_sold, _machineId) {
        this._sold = _sold;
        this._machineId = _machineId;
    }
    machineId() {
        return this._machineId;
    }
    getSoldQuantity() {
        return this._sold;
    }
    type() {
        return 'sale';
    }
}
class MachineRefillEvent {
    _refill;
    _machineId;
    constructor(_refill, _machineId) {
        this._refill = _refill;
        this._machineId = _machineId;
    }
    machineId() {
        throw new Error("Method not implemented.");
    }
    type() {
        throw new Error("Method not implemented.");
    }
}
class MachineSaleSubscriber {
    machines;
    constructor(machines) {
        this.machines = machines;
    }
    handle(event) {
        this.machines[2].stockLevel -= event.getSoldQuantity();
    }
}
class MachineRefillSubscriber {
    handle(event) {
        throw new Error("Method not implemented.");
    }
}
// objects
class Machine {
    stockLevel = 10;
    id;
    constructor(id) {
        this.id = id;
    }
}
// helpers
const randomMachine = () => {
    const random = Math.random() * 3;
    if (random < 1) {
        return '001';
    }
    else if (random < 2) {
        return '002';
    }
    return '003';
};
const eventGenerator = () => {
    const random = Math.random();
    if (random < 0.5) {
        const saleQty = Math.random() < 0.5 ? 1 : 2; // 1 or 2
        return new MachineSaleEvent(saleQty, randomMachine());
    }
    const refillQty = Math.random() < 0.5 ? 3 : 5; // 3 or 5
    return new MachineRefillEvent(refillQty, randomMachine());
};
// program
(async () => {
    // create 3 machines with a quantity of 10 stock
    const machines = [new Machine('001'), new Machine('002'), new Machine('003')];
    // create a machine sale event subscriber. inject the machines (all subscribers should do this)
    const saleSubscriber = new MachineSaleSubscriber(machines);
    // create the PubSub service
    const pubSubService = null; // implement and fix this
    // create 5 random events
    const events = [1, 2, 3, 4, 5].map(i => eventGenerator());
    // publish the events
    events.map(pubSubService.publish);
})();
//# sourceMappingURL=app.js.map