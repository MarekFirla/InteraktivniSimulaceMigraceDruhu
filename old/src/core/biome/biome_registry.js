export class BiomeRegistry {
    constructor() {
        this.biomes = new Map();
    }

    async load() {
        const data = [
            {
                id: 0,
                name: "Grass",
                texture: "grass.jpg",
                temperature: 18,
                water_access: 0.8,
                fertility: 0.9
            },
            {
                id: 1,
                name: "Forest",
                texture: "forest.jpg",
                temperature: 15,
                water_access: 0.9,
                fertility: 1.0
            }
        ];

        data.forEach(b => {
            this.biomes.set(b.id, {
                id: b.id,
                name: b.name,
                texture: `/assets/textures/biomes/${b.texture}`,
                color: b.id === 0 ? "#55aa55" : "#226622", // TEMP
                simulation: {
                    temperature: b.temperature,
                    water: b.water_access,
                    fertility: b.fertility
                }
            });
        });



    }

    get(id) {
        return this.biomes.get(id);
    }

    getAll() {
        return [...this.biomes.values()];
    }
}
