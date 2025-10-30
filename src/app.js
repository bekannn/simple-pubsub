"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Question 1
class PublishSubscripeService {
    events_subscriber = new Map();
    constructor() {
        this.publish = this.publish.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
    }
    publish(event) {
        const subs = this.events_subscriber.get(event.type()) || [];
        for (const handler of subs) {
            handler.handle(event);
        }
    }
    subscribe(type, handler) {
        const subs = this.events_subscriber.get(type) || [];
        subs.push(handler); // Add new event handler
        this.events_subscriber.set(type, subs); // Set the new handler array
    }
    unsubscribe(type, handler) {
        const subs = this.events_subscriber.get(type) || [];
        const newSubs = subs.filter(h => h !== handler); // Create a new array without the specific handler
        this.events_subscriber.set(type, newSubs);
    }
}
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
        return this._machineId;
    }
    getRefillQuantity() {
        return this._refill;
    }
    type() {
        return 'refill';
    }
}
class MachineSaleSubscriber {
    machines;
    constructor(machines) {
        this.machines = machines;
    }
    handle(event) {
        const machine = this.machines.find(m => m.id === event.machineId());
        if (machine) {
            const soldNumber = event.getSoldQuantity();
            machine.stockLevel -= soldNumber;
            console.log(`[Sale] There were ${soldNumber} items sold for machine #${machine.id}.`);
        }
    }
}
// Question 3
class MachineRefillSubscriber {
    machines;
    constructor(machines) {
        this.machines = machines;
    }
    handle(event) {
        const machine = this.machines.find(m => m.id === event.machineId());
        if (machine) {
            const refill_number = event.getRefillQuantity();
            machine.stockLevel += refill_number;
            console.log(`[Refill] There were ${refill_number} items refilled to machine #${machine.id}.`);
        }
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
        console.log(`[SALE] New event: Quantity ${saleQty}`);
        return new MachineSaleEvent(saleQty, randomMachine());
    }
    const refillQty = Math.random() < 0.5 ? 3 : 5; // 3 or 5
    console.log(`[REFILL] New event: Quantity ${refillQty}`);
    return new MachineRefillEvent(refillQty, randomMachine());
};
// program
(async () => {
    // create 3 machines with a quantity of 10 stock
    const machines = [new Machine('001'), new Machine('002'), new Machine('003')];
    // create a machine sale event subscriber. inject the machines (all subscribers should do this)
    const saleSubscriber = new MachineSaleSubscriber(machines);
    const refillSubscriber = new MachineRefillSubscriber(machines);
    // create the PubSub service
    const pubSubService = new PublishSubscripeService(); // implement and fix this
    pubSubService.subscribe('sale', saleSubscriber);
    pubSubService.subscribe('refill', refillSubscriber);
    // create random events
    const events = [1, 2, 3].map(i => eventGenerator());
    // publish the events
    events.map(pubSubService.publish);
    // try unsubscribing
    pubSubService.unsubscribe('refill', refillSubscriber);
    // create random events
    const events2 = [1, 2, 3].map(i => eventGenerator());
    // publish the events (there should be no refill handler events here)
    events2.map(pubSubService.publish);
})();
//# sourceMappingURL=app.js.map