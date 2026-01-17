export class SpeciesRegistry {
    constructor() {
        this.species = new Map();
    }

    async load() {
        const data = [
            {
                id: 0,
                name: "Dandelion",
                color: "#aa7744",
                mesh: "dandelion.glb",
                icon: "dandelion.png",
                radius: 1,
                scale: 2,
                speed: 0,
                energy: 100
            },
            {
                id: 1,
                name: "Bee",
                color: "#555555",
                mesh: "bee.glb",
                icon: "bee.png",
                scale: 0.1,
                radius: 0.5,
                speed: 1.8,
                energy: 120,
                canFly: true
            }
        ];

        data.forEach(s => {
            this.species.set(s.id, {
                id: s.id,
                name: s.name,
                color: s.color,
                render: {
                    mesh: `/assets/mesh/${s.mesh}`,
                    icon: `/assets/mesh/icon/${s.icon}`,
                    scale: 1,
                    yOffset: 0
                },
                simulation: {
                    speed: s.speed,
                    energy: s.energy,
                    canFly: !!s.canFly
                }
            });
        });
    }


    get(id) {
        return this.species.get(id);
    }

    getAll() {
        return [...this.species.values()];
    }
}
