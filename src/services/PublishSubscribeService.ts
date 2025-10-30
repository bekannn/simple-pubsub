import { ISubscriber, IEvent, IPublishSubscribeService, EventType } from "../models";


export class PublishSubscribeService implements IPublishSubscribeService {
    private events_subscriber: Map<String, ISubscriber[]> = new Map();
    private queue: IEvent[] = []; // Events queue
    private processing: Boolean = false;

    constructor() {
      this.publish = this.publish.bind(this);
      this.subscribe = this.subscribe.bind(this);
      this.unsubscribe = this.unsubscribe.bind(this);
    }
  
    publish(event: IEvent): void {
      this.queue.push(event);
      this.processQueue();
    }

    private processQueue() {
      if (this.processing) return; // ensure events are processed in order
      this.processing = true;
      while (this.queue.length > 0) {
        const event = this.queue.shift()!; // retrive the oldest event first
         console.log(`[Event: ${event.type()}] At Machine #${event.machineId()}`);
        const handlers = this.events_subscriber.get(event.type()) || [];
        for (const handler of handlers) {
          handler.handle(event);
        }
      }
      this.processing = false;
    }
  
    subscribe(type: EventType, handler: ISubscriber): void {
      const subs = this.events_subscriber.get(type) || [];
      subs.push(handler); // Add new event handler
      this.events_subscriber.set(type, subs); // Set the new handler array
    }
  
    unsubscribe(type: EventType, handler: ISubscriber): void {
        const subs = this.events_subscriber.get(type) || [];
        const newSubs = subs.filter(h => h !== handler); // Create a new array without the specific handler
        this.events_subscriber.set(type, newSubs);
        console.log(`[Unsubscribe] ${handler.constructor.name} unsubscribed from ${type} event`)
    }
  
  }
  