import { ISubscriber, IEvent, IPublishSubscribeService, EventType } from "../models";


export class PublishSubscribeService implements IPublishSubscribeService {
    private events_subscriber: Map<EventType, ISubscriber[]> = new Map();
    private queue: IEvent[] = []; // Events queue
    private processing: boolean = false;

    constructor() {
      this.publish = this.publish.bind(this);
      this.subscribe = this.subscribe.bind(this);
      this.unsubscribe = this.unsubscribe.bind(this);
    }
  
    publish(event: IEvent): void {
      this.queue.push(event);
      console.log(`[PUB] Added event ${event.type()} to queue`);
      this.processQueue();
    }

    private processQueue() {
      if (this.processing) {
        console.log('...Enter queue while processing');
        return;} // ensure events are processed in order
      this.processing = true;
      console.log('...Start processing (set to true)');
      while (this.queue.length > 0) {
        const event = this.queue.shift()!; // retrive the oldest event first
         console.log(`[EVENT: ${event.type()}] At Machine #${event.machineId()}`);
        const handlers = this.events_subscriber.get(event.type()) || [];
        for (const handler of handlers) {
          handler.handle(event);
        }
      }
      console.log('...Done processing');
      this.processing = false;
    }
  
    subscribe(type: EventType, handler: ISubscriber): void {
      const subs = this.events_subscriber.get(type) || [];
      if (subs.includes(handler)) {
        console.log(`[DUPLICATE_SUB] The ${handler.constructor.name} has already subscribed to ${type} event.`);
        return;
      }

      subs.push(handler); // Add new event handler
      this.events_subscriber.set(type, subs); // Set the new handler array
    }
  
    unsubscribe(type: EventType, handler: ISubscriber): void {
        const subs = this.events_subscriber.get(type) || [];
        const newSubs = subs.filter(h => h !== handler); // Create a new array without the specific handler
        this.events_subscriber.set(type, newSubs);
        console.log(`[UN_SUB] ${handler.constructor.name} unsubscribed from ${type} event`)
    }
  
  }
  