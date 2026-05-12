import { BiomeRegistry } from "./biome/biome_registry.js";
import { SpeciesRegistry } from "./population/species_registry.js";
import { TerrainRegistry } from "./terrain/terrain_registry.js";

export class AssetsRegistry {
    #biomeRegistry;
    #speciesRegistry;
    #terrainRegistry;   
    constructor() {

        this.#biomeRegistry = new BiomeRegistry();
        this.#speciesRegistry = new SpeciesRegistry();
        this.#terrainRegistry = new TerrainRegistry();
    }

    get biomeRegistry() {
        return this.#biomeRegistry;
    }

    get speciesRegistry() {
        return this.#speciesRegistry;
    }

    get TerrainRegistry() {
        return this.#terrainRegistry;
    }
}