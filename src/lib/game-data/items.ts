// src/lib/game-data/items.ts
import { type Resource, Resources, type Item, Items, type EquipmentSlot } from '@/lib/game-types';

export const itemData: Record<Resource | Item, { name: string; description: string, equipSlot?: EquipmentSlot, sellPrice?: number }> = {
  // Resources
  wood: { name: Resources.wood, description: 'A sturdy piece of wood. Useful for building and fuel.', sellPrice: 1 },
  stone: { name: Resources.stone, description: 'A chunk of rock. Good for basic tools and structures.', sellPrice: 1 },
  scrap: { name: Resources.scrap, description: 'Twisted metal from the old world. Can be smelted and repurposed.', sellPrice: 3 },
  apple: { name: Resources.apple, description: 'A tough, slightly mutated apple. Keeps hunger at bay.', sellPrice: 4 },
  water: { name: Resources.water, description: 'Purified water, safe to drink.', sellPrice: 4 },
  components: { name: Resources.components, description: 'Advanced electronic parts. Key to automation.', sellPrice: 20 },
  uranium: { name: Resources.uranium, description: 'A rare, radioactive element needed for high-tier power.', sellPrice: 100 },
  lemon: { name: Resources.lemon, description: 'A sour, yellow fruit.', sellPrice: 5 },
  banana: { name: Resources.banana, description: 'A yellow fruit.', sellPrice: 5 },
  peach: { name: Resources.peach, description: 'A fuzzy fruit.', sellPrice: 5 },
  silver: { name: Resources.silver, description: 'An old-world currency, still valued by traders.' },
  mutatedTwigs: { name: Resources.mutatedTwigs, description: 'Flexible, oddly colored twigs from the mutated forest. They hum with a faint energy.', sellPrice: 8 },
  ironIngot: { name: Resources.ironIngot, description: 'A bar of refined iron, ready for advanced crafting.', sellPrice: 30 },
  biomass: { name: Resources.biomass, description: 'Dense, energy-rich organic matter.', sellPrice: 250 },


  // Crafted Items
  stoneAxe: { name: Items.stoneAxe, description: 'A simple axe. Increases wood gathering by 50%.', equipSlot: 'hand', sellPrice: 25 },
  metalDetector: { name: Items.metalDetector, description: 'A device that helps find metal. Increases scrap finding by 20%.', equipSlot: 'hand', sellPrice: 50 },
  workbench: { name: Items.workbench, description: 'Unlocks more complex crafting recipes.' },
  waterPurifier: { name: Items.waterPurifier, description: 'A device to turn contaminated water into a drinkable resource.' },
  furnace: { name: Items.furnace, description: 'Used to smelt ores and scrap metal into ingots.' },
  radio: { name: Items.radio, description: 'Can pick up strange signals and story fragments.' },
  generator: { name: Items.generator, description: 'Provides power to your automated systems.' },
  droneBay: { name: Items.droneBay, description: 'Launches scavenger drones to automatically find resources.' },
  hydroponicsBay: { name: Items.hydroponicsBay, description: 'An automated bay that grows edible plants.' },
  miningRig: { name: Items.miningRig, description: 'An automated rig that extracts resources from the earth.' },
  cookedApple: { name: Items.cookedApple, description: 'A cooked apple that restores some energy.', sellPrice: 8 },
  crudeMap: { name: Items.crudeMap, description: 'Unlocks the ability to travel to new locations.' },
  ironPlates: { name: Items.ironPlates, description: 'Reinforced plates of solid iron. Used for heavy construction.', sellPrice: 160 },
  biomassCompressor: { name: Items.biomassCompressor, description: 'A machine that unlocks the ability to create biomass.' },
};
