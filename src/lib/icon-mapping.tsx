// Icon Mapping System for Wasteland Automata
// Maps game items, resources, and UI elements to sprite icon names

import React from 'react';
import { SpriteIcon } from '@/components/ui/sprite-icon';

// Map item IDs to sprite icon names
const ITEM_ICON_MAP: Record<string, string> = {
    // Basic Resources
    wood: 'wood',
    rock: 'stone',
    stone: 'stone',
    water: 'water',

    // Food Items
    apple: 'apple',
    peach: 'peach',
    cookedApple: 'cookedApple',
    cookedPeach: 'cookedApple',
    appleSeed: 'appleSeeds',
    appleSeeds: 'appleSeeds',
    peachSeed: 'appleSeeds',
    banana: 'banana',
    lemon: 'lemon',
    mutatedTwigs: 'mutatedTwigs',

    // Materials
    scrap: 'scrap',
    scrapMetal: 'scrap',
    iron: 'ironIngot',
    ironPlates: 'ironPlates',
    uranium: 'uranium',
    biomass: 'biomass',
    charcoal: 'charcoal',
    components: 'components',
    radio: 'default',
    generator: 'energy',
    sand: 'sand',
    glassTube: 'glassTube',
    glassJar: 'glassJar',
    pickledPeaches: 'pickledPeaches',
    droneBay: 'default',
    hydroponicsBay: 'default',
    miningRig: 'craft',
    biomassCompressor: 'biomassCompressor',
    crudeMap: 'explore',

    // Tools
    metalDetector: 'metalDetector',
    stoneAxe: 'stoneAxe',
    pickaxe: 'pickaxe',
    axe: 'stoneAxe',

    // Junk/Misc
    rustyCan: 'rustyCan',
    can: 'rustyCan',

    // Fish - all map to generic fish icon or specific ones
    mutantMinnow: 'mutantMinnow',
    radPerch: 'radPerch',
    goldenMinnow: 'goldenMinnow',
    glowingAlgae: 'glowingAlgae',
    algae: 'glowingAlgae',
    sludgeBass: 'fish',
    irradiatedCarp: 'fish',
    bioLuminescentMoss: 'glowingAlgae',
    oldBoot: 'junk',
    goldenBass: 'goldenMinnow',
    glowfish: 'fish',
    mutantCatfish: 'fish',
    reactorCoreShard: 'junk',
    goldenGlowfish: 'goldenMinnow',
    bunkerCarp: 'fish',
    caveEel: 'fish',
    armoredFish: 'fish',
    militaryRation: 'junk',
    waterloggedDataChip: 'junk',
    goldenEel: 'goldenMinnow',
    preWarTech: 'junk',
    acidSwimmer: 'fish',
    toxicTrout: 'fish',
    chemicalCarp: 'fish',
    strangeCrystal: 'junk',
    chemicalSample: 'junk',
    goldenSwimmer: 'goldenMinnow',
    experimentalCompound: 'junk',
    craterDweller: 'fish',
    depthFish: 'fish',
    meteorFragment: 'junk',
    cosmicDebris: 'junk',
    goldenCraterFish: 'goldenMinnow',
    meteoriteShard: 'junk',
    ancientArtifact: 'junk',
    urbanScavengerFish: 'fish',
    rubbleSwimmer: 'fish',
    buildingMaterial: 'junk',
    preWarCurrency: 'junk',
    glassShard: 'junk',
    goldenCityFish: 'goldenMinnow',
    pristinePreWarItem: 'junk',
    treasureCache: 'junk',

    // Stats
    energy: 'energy',
    silver: 'silver',
    money: 'silver',
    health: 'health',
    hp: 'health',
};

// Map navigation keys to sprite icon names
const NAV_ICON_MAP: Record<string, string> = {
    explore: 'explore',
    exploration: 'explore',
    quests: 'quest',
    quest: 'quest',
    inventory: 'inventory',
    bag: 'inventory',
    craft: 'craft',
    crafting: 'craft',
    character: 'character',
    player: 'character',
    base: 'base',
    home: 'base',
    furnace: 'furnace',
    smelting: 'furnace',
    market: 'market',
    shop: 'market',
    farming: 'farming',
    farm: 'farming',
    hydroponics: 'farming',
    fishing: 'fishing',
    fish: 'fish',
    factory: 'factory',
    machines: 'factory',
    skills: 'skills',
    skillTree: 'skills',
    tech: 'tech',
    technology: 'tech',
    upgrades: 'tech',
    logo: 'default',
    wasteland: 'default',
    mining: 'mining',
};

// Component wrapper for easy icon rendering
interface GameIconProps {
    type: 'item' | 'nav';
    id: string;
    size?: number;
    className?: string;
    fallback?: React.ReactNode;
}

export const GameIcon: React.FC<GameIconProps> = ({
    type,
    id,
    size = 24,
    className = '',
    fallback = null
}) => {
    const iconMap = type === 'item' ? ITEM_ICON_MAP : NAV_ICON_MAP;
    const iconName = iconMap[id] || 'default';

    if (!iconName && fallback) {
        return <>{fallback}</>;
    }

    return <SpriteIcon name={iconName} size={size} className={className} />;
};

// Export individual icon components for backward compatibility
// These now use the sprite system under the hood
export const WoodIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="wood" {...props} />;
export const RockIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="stone" {...props} />;
export const WaterIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="water" {...props} />;
export const AppleIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="apple" {...props} />;
export const PeachIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="peach" {...props} />;
export const CookedAppleIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="cookedApple" {...props} />;
export const ScrapMetalIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="scrap" {...props} />;
export const IronIngotIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="ironIngot" {...props} />;
export const ComputerComponentIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="components" {...props} />;
export const AppleSeedIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="appleSeeds" {...props} />;
export const CharcoalIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="charcoal" {...props} />;
export const MetalDetectorIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="metalDetector" {...props} />;
export const StoneAxeIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="stoneAxe" {...props} />;
export const RustyCanIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="rustyCan" {...props} />;
export const MutantMinnowIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="mutantMinnow" {...props} />;
export const RadPerchIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="radPerch" {...props} />;
export const GoldenMinnowIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="goldenMinnow" {...props} />;
export const GlowingAlgaeIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="glowingAlgae" {...props} />;
export const ScrapIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="junk" {...props} />;
export const FoodIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="apple" {...props} />;
export const DrinkIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="water" {...props} />;
export const EnergyIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="energy" {...props} />;
export const SilverIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="silver" {...props} />;
export const HeartIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="health" {...props} />;
export const ExploreIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="explore" {...props} />;
export const QuestIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="quest" {...props} />;
export const InventoryIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="inventory" {...props} />;
export const CraftIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="craft" {...props} />;
export const CharacterIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="character" {...props} />;
export const BaseIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="base" {...props} />;
export const FurnaceIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="furnace" {...props} />;
export const MarketIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="market" {...props} />;
export const FarmingIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="farming" {...props} />;
export const FishingIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="fishing" {...props} />;
export const FactoryIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="factory" {...props} />;
export const SkillsIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="skills" {...props} />;
export const TechIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="tech" {...props} />;
export const WastelandAutomataIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <SpriteIcon name="default" {...props} />;
export const MiningIcon: React.FC<{ className?: string; size?: number }> = (props) =>
    <GameIcon type="nav" id="mining" {...props} />;