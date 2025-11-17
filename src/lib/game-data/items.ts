// src/lib/game-data/items.ts
import { type Resource, Resources, type Item, Items, type EquipmentSlot } from '@/lib/game-types';

export const itemData: Record<Resource | Item, { name: string; description: string, equipSlot?: EquipmentSlot }> = {
  // Resources
  wood: { name: Resources.wood, description: 'A sturdy piece of wood. Useful for building and fuel.' },
  stone: { name: Resources.stone, description: 'A chunk of rock. Good for basic tools and structures.' },
  scrap: { name: Resources.scrap, description: 'Twisted metal from the old world. Can be smelted and repurposed.' },
  apple: { name: Resources.apple, description: 'A tough, slightly mutated apple. Keeps hunger at bay.' },
  water: { name: Resources.water, description: 'Purified water, safe to drink.' },
  components: { name: Resources.components, description: 'Advanced electronic parts. Key to automation.' },
  uranium: { name: Resources.uranium, description: 'A rare, radioactive element needed for high-tier power.' },
  lemon: { name: Resources.lemon, description: 'A sour, yellow fruit.' },
  banana: { name: Resources.banana, description: 'A long, yellow fruit.' },
  peach: { name: Resources.peach, description: 'A fuzzy, sweet fruit.' },

  // Crafted Items
  stoneAxe: { name: Items.stoneAxe, description: 'A simple axe for chopping wood more efficiently.', equipSlot: 'hand' },
  workbench: { name: Items.workbench, description: 'Unlocks more complex crafting recipes.' },
  waterPurifier: { name: Items.waterPurifier, description: 'A device to turn contaminated water into a drinkable resource.' },
  furnace: { name: Items.furnace, description: 'Used to smelt ores and scrap metal into ingots.' },
  radio: { name: Items.radio, description: 'Can pick up strange signals and story fragments.' },
  generator: { name: Items.generator, description: 'Provides power to your automated systems.' },
  droneBay: { name: Items.droneBay, description: 'Launches scavenger drones to automatically find resources.' },
  miningRig: { name: Items.miningRig, description: 'An automated rig that extracts resources from the earth.' },
  cookedApple: { name: Items.cookedApple, description: 'A cooked apple that restores some energy.' },
};
