import { MachineRefillEvent } from "./events/RefillEvent";
import { MachineSaleEvent } from "./events/SaleEvent";
import { Machine, EventType, IEvent } from "./models";
import { MachineRepository } from "./models/MachineRepository";
import { PublishSubscribeService } from "./services/PublishSubscribeService";
import { LowStockWarningSubscriber } from "./subcribers/LowStockWarningSubscriber";
import { MachineRefillSubscriber } from "./subcribers/RefillSubscriber";
import { MachineSaleSubscriber } from "./subcribers/SaleSubscriber";
import { StockLevelSubscriber } from "./subcribers/StockLevelSubscriber";

let machineRepository: MachineRepository;
let pubSubService: PublishSubscribeService;
let events: IEvent[];
let saleSubscriber: MachineSaleSubscriber;
let refillSubscriber: MachineRefillSubscriber;
let stockLevelSubscriber: StockLevelSubscriber;
let lowStockWarningSubscriber: LowStockWarningSubscriber;
let consoleSpy: jest.SpyInstance;
   

beforeAll(() => {
    // Initialize machines, create subscriber instances, and initialize consolSpy
    machineRepository = new MachineRepository();
    machineRepository.saveMachine(new Machine("001"));
    machineRepository.saveMachine(new Machine("002"));
    machineRepository.saveMachine(new Machine("003"));
    pubSubService = new PublishSubscribeService();
    saleSubscriber = new MachineSaleSubscriber(machineRepository);
    refillSubscriber = new MachineRefillSubscriber(machineRepository);
    stockLevelSubscriber = new StockLevelSubscriber(machineRepository, pubSubService);
    lowStockWarningSubscriber = new LowStockWarningSubscriber(machineRepository, pubSubService);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

beforeEach(() => {
    // Reset the machine state
    machineRepository.getAllMachines().map(machine => machine.stockLevel = 10);
    // Clear console spy
    consoleSpy.mockClear();
});

describe("Single Event", () => {

    afterAll(() => {
        // Unsubscriber to all
        pubSubService.unsubscribe(EventType.SALE, saleSubscriber);
        pubSubService.unsubscribe(EventType.REFILL, refillSubscriber);
        pubSubService.unsubscribe(EventType.SALE, stockLevelSubscriber);
        pubSubService.unsubscribe(EventType.REFILL, stockLevelSubscriber);
        pubSubService.unsubscribe(EventType.LEVEL_WARNING, lowStockWarningSubscriber);
      });
      
    
    test("Sale Event Handling", () => {
        // Let saleSubscriber subscribe to sale event
        pubSubService.subscribe(EventType.SALE, saleSubscriber);

        const machine = machineRepository.getMachineById("001");
        const saleEvent = new MachineSaleEvent(2, "001")
        pubSubService.publish(saleEvent);

        // Check stock level remaining
        expect(machine?.stockLevel).toEqual(8);
    });

    test("Refill Event Handling", () => {
        // Let refillSubscriber subscribe to refill event
        pubSubService.subscribe(EventType.REFILL, refillSubscriber);

        const machine = machineRepository.getMachineById("001");
        const saleEvent = new MachineSaleEvent(2, "001")
        pubSubService.publish(saleEvent);
        const refillEvent = new MachineRefillEvent(1, "001");
        pubSubService.publish(refillEvent);

        // Check stock level increasing
        expect(machine?.stockLevel).toEqual(9);
        
    });

    test("Low Stock Warning", () => {
        // Let StocklevelSubscriber subscribe to sale event
        pubSubService.subscribe(EventType.SALE, stockLevelSubscriber);

        const machine = machineRepository.getMachineById("002");
        const saleEvent1 = new MachineSaleEvent(8, "002");
        const saleEvent2 = new MachineSaleEvent(1, "002");
        pubSubService.publish(saleEvent1);

        // First Warning log
        expect(consoleSpy).toHaveBeenCalledWith("[WARNING] Machine #002 stock level dropped to 2!");
        
        pubSubService.publish(saleEvent2);

        // Final Stock level dropping
        expect(machine?.stockLevel).toEqual(1);
        // Ensure no duplicate warning log
        expect(consoleSpy).not.toHaveBeenCalledWith("[WARNING] Machine #002 stock level dropped to 1!");

        
    });

    test("Stock Ok Announcement", () => {
        // Let StocklevelSubscriber subscribe to refill event
        pubSubService.subscribe(EventType.REFILL, stockLevelSubscriber);
        const machine = machineRepository.getMachineById("002");
        const saleEvent = new MachineSaleEvent(8, "002");
        pubSubService.publish(saleEvent);

        const refillEvent1 = new MachineRefillEvent(3, "002");
        const refillEvent2 = new MachineRefillEvent(1, "002");

        pubSubService.publish(refillEvent1);

        // First announcement log
        expect(consoleSpy).toHaveBeenCalledWith("[OK] Machine #002 stock level is 5.");

        pubSubService.publish(refillEvent2);

        // Final stock level increasing
        expect(machine?.stockLevel).toEqual(6);
        // Ensure no duplicate announcement
        expect(consoleSpy).not.toHaveBeenCalledWith("[OK] Machine #002 stock level is 6.");
    });

    test("Automatic Refill Handling", () => {
        // Let lowStockWarningSubscriber subscribe to low stock warning event
        pubSubService.subscribe(EventType.LEVEL_WARNING, lowStockWarningSubscriber);
        const machine = machineRepository.getMachineById("003");
        const saleEvent = new MachineSaleEvent(9, "003");
        pubSubService.publish(saleEvent);

        // Check stock level after auto-refilling
        expect(machine?.stockLevel).toEqual(10);
    });
});

describe("Multiple Events", () => {

    afterAll(() => {
        // Unsubscribe to all
        pubSubService.unsubscribe(EventType.SALE, saleSubscriber);
        pubSubService.unsubscribe(EventType.REFILL, refillSubscriber);
        pubSubService.unsubscribe(EventType.SALE, stockLevelSubscriber);
        pubSubService.unsubscribe(EventType.REFILL, stockLevelSubscriber);
        pubSubService.unsubscribe(EventType.LEVEL_WARNING, lowStockWarningSubscriber);
      });
      

    test("Multiple sales and refill events in order", () => {
        // Let saleSubscriber subscribe to sale event
        pubSubService.subscribe(EventType.SALE, saleSubscriber);
        // Let refillSubscriber subscribe to refill event
        pubSubService.subscribe(EventType.REFILL, refillSubscriber);

        const machine = machineRepository.getMachineById("001");
        const events1 = [
            new MachineSaleEvent(2, "001"),
            new MachineSaleEvent(10, "001"),
            new MachineRefillEvent(3, "001")
        ];

        events1.map(pubSubService.publish);

        // Check unfulfilled sale log
        expect(consoleSpy).toHaveBeenCalledWith("[SALE - UNFULFILLED] Machine #001 sold 8 items from 10 requested (remaining: 0).")
        // Check stock level after refilling
        expect(machine?.stockLevel).toEqual(3);
    });

    test("Multiple sales and refill events with announcements", () => {
        // Let stockLevelSubscriber subscribe to sale and refill events
        pubSubService.subscribe(EventType.SALE, stockLevelSubscriber);
        pubSubService.subscribe(EventType.REFILL, stockLevelSubscriber);
        // Let lowStockWarningSubscriber subscribe to warning event
        pubSubService.subscribe(EventType.LEVEL_WARNING, lowStockWarningSubscriber);

        const machine = machineRepository.getMachineById("002");
        const events2 = [
            new MachineSaleEvent(3, "002"),
            new MachineSaleEvent(5, "002"),
            new MachineRefillEvent(3, "002"),
            new MachineSaleEvent(4, "002")
        ];

        events2.map(pubSubService.publish);

        // Check warning log
        expect(consoleSpy).toHaveBeenCalledWith("[WARNING] Machine #002 stock level dropped to 2!");
        // Check ok announcement log
        expect(consoleSpy).toHaveBeenCalledWith("[OK] Machine #002 stock level is 10.");
        // Check over refilling cancelation
        expect(consoleSpy).toHaveBeenCalledWith("[REFILL - FULL] Machine #002 refill has been canceled (remaining: 10).");
        // Check final stock level
        expect(machine?.stockLevel).toEqual(6);

    });
});
