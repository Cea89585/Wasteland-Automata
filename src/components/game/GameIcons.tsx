// src/components/game/GameIcons.tsx
import {
  Trees,
  Gem,
  Wrench,
  Apple,
  GlassWater,
  Cpu,
  Atom,
  Hammer,
  Factory,
  Droplets,
  Radio,
  Power,
  Bot,
  Drill,
  HeartPulse,
  Sandwich,
  CupSoda,
  Battery,
  Search,
  Zap,
  Bed,
  type LucideProps,
  Banana,
  Citrus, // Changed from Lemon
  Grape, // Changed from Beef
} from 'lucide-react';
import type { Resource, Item } from '@/lib/game-types';

type IconMap = Record<string, React.ReactElement<LucideProps>>;

const iconProps: LucideProps = {
  className: 'inline-block h-4 w-4 mr-1.5 align-middle text-muted-foreground',
};

export const resourceIcons: Record<Resource, React.ReactElement<LucideProps>> = {
  wood: <Trees {...iconProps} />,
  stone: <Gem {...iconProps} />,
  scrap: <Wrench {...iconProps} />,
  apple: <Apple {...iconProps} />,
  water: <GlassWater {...iconProps} />,
  components: <Cpu {...iconProps} />,
  uranium: <Atom {...iconProps} />,
  lemon: <Citrus {...iconProps} />,
  banana: <Banana {...iconProps} />,
  peach: <Grape {...iconProps} />,
};

export const itemIcons: Record<Item, React.ReactElement<LucideProps>> = {
  stoneAxe: <Hammer {...iconProps} />,
  workbench: <Factory {...iconProps} />,
  waterPurifier: <Droplets {...iconProps} />,
  furnace: <Power {...iconProps} />,
  radio: <Radio {...iconProps} />,
  generator: <Power {...iconProps} />,
  droneBay: <Bot {...iconProps} />,
  miningRig: <Drill {...iconProps} />,
  cookedApple: <Zap {...iconProps} />,
};

export const statIcons = {
    health: <HeartPulse {...iconProps} />,
    hunger: <Sandwich {...iconProps} />,
    thirst: <CupSoda {...iconProps} />,
    energy: <Battery {...iconProps} />,
}

export const allIcons: IconMap = { ...resourceIcons, ...itemIcons };
