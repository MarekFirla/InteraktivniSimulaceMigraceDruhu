export class PopulationMap {
    constructor() {
        // tohle pøepsat na uspornìjší pole
        this.entities = new Map();
        this.nextId = 1;
    }

    add(speciesId, position, grid = null) {
        const id = this.nextId++;
        this.entities.set(id, {
            id,
            species_id: speciesId,
            position,
            grid
        });
        return id;
    }


    remove(id) {
        this.entities.delete(id);
    }

    get(id) {
        return this.entities.get(id);
    }

    getAll() {
        return [...this.entities.values()];
    }

    clear() {
        this.entities.clear();
        this.nextId = 1;
    }
}
