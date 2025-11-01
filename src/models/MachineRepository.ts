import { Machine, IMachineRepository } from ".";

export class MachineRepository implements IMachineRepository {
    private machines: Map<string, Machine> = new Map();

    getMachineById(id: string): Machine | undefined {
        return this.machines.get(id);
    }

    getAllMachines(): Machine[] {
        return Array.from(this.machines.values());
    }

    saveMachine(machine: Machine): void {
        if (this.machines.has(machine.id)) {
            console.log(`[DUPLICATE_MACHINE] Machine id #${machine.id} already exists.`);
            return;
        }
        this.machines.set(machine.id, machine);
    }

    deleteMachine(machine: Machine): void {
        if (!this.machines.has(machine.id)) {
            console.log(`[MACHINE_NOT_FOUND] Cannot delete machine id #${machine.id} since it is not found`);
            return;
        }
        this.machines.delete(machine.id);
    }
}