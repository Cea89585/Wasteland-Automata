// src/lib/game-data/locations.ts
import type { LocationId, Resource } from '@/lib/game-types';

interface ResourceFind {
  resource: Resource;
  min: number;
  max: number;
  chance: number; // 0 to 1
}

export interface LocationData {
  id: LocationId;
  name: string;
  description: string;
  resources: ResourceFind[];
  flavorText: string[];
}

export const locations: Record<LocationId, LocationData> = {
  outskirts: {
    id: 'outskirts',
    name: 'Ruined City Outskirts',
    description: 'The crumbling remains of suburbia, now picked clean by the wind and scavengers.',
    resources: [
      { resource: 'wood', min: 1, max: 3, chance: 0.7 },
      { resource: 'stone', min: 2, max: 4, chance: 0.8 },
      { resource: 'scrap', min: 1, max: 2, chance: 0.4 },
      { resource: 'apple', min: 1, max: 1, chance: 0.1 },
    ],
    flavorText: [
      'A rusted car sits silently, its doors creaking in the wind.',
      'You see a faded mural on a crumbling wall, a relic of a forgotten time.',
      'The silence is broken only by the distant caw of a mutated crow.',
      'A child\'s toy lies half-buried in the dust, a sad reminder of the past.',
    ],
  },
  forest: {
    id: 'forest',
    name: 'Mutated Forest',
    description: 'A dense, overgrown forest with strangely colored flora. The air is thick and humid.',
    resources: [
      { resource: 'wood', min: 3, max: 6, chance: 0.9 },
      { resource: 'apple', min: 1, max: 2, chance: 0.3 },
    ],
    flavorText: [
      'The trees here have an unsettling, almost intelligent look to them.',
      'You hear a strange rustling in the undergrowth nearby.',
    ],
  },
  tunnels: {
    id: 'tunnels',
    name: 'Abandoned Subway',
    description: 'Dark, damp tunnels that snake beneath the dead city.',
    resources: [
      { resource: 'scrap', min: 2, max: 5, chance: 0.6 },
      { resource: 'components', min: 1, max: 1, chance: 0.05 },
    ],
    flavorText: [
      'A distant dripping sound echoes through the darkness.',
      'Old posters on the walls advertise products that no longer exist.',
    ],
  },
  wasteland: {
    id: 'wasteland',
    name: 'Dry Wasteland',
    description: 'A vast, arid expanse of cracked earth and shimmering heat.',
    resources: [
      { resource: 'stone', min: 5, max: 10, chance: 0.9 },
      { resource: 'uranium', min: 1, max: 1, chance: 0.02 },
    ],
    flavorText: [
      'The sun beats down mercilessly.',
      'A skeleton of some large, unidentifiable beast is half-buried in the sand.',
    ],
  },
  bunker: {
    id: 'bunker',
    name: 'Underground Bunker',
    description: 'A sealed metal door leads into a pre-apocalypse fallout shelter.',
     resources: [
      { resource: 'apple', min: 2, max: 5, chance: 0.5 },
      { resource: 'water', min: 2, max: 5, chance: 0.5 },
      { resource: 'components', min: 1, max: 3, chance: 0.2 },
    ],
    flavorText: [
        'The air inside is stale and smells of ozone.',
        'Emergency lights flicker ominously.'
    ],
  },
  industrial: {
    id: 'industrial',
    name: 'Old Industrial Zone',
    description: 'A maze of rusting factories and silent machinery.',
     resources: [
      { resource: 'scrap', min: 5, max: 10, chance: 0.8 },
      { resource: 'components', min: 2, max: 4, chance: 0.3 },
    ],
    flavorText: [
        'The smell of oil and rust hangs heavy in the air.',
        'A factory whistle moans as the wind blows through it.'
    ],
  },
};
