// Icon Mapping System for Wasteland Automata
// Maps game items, resources, and UI elements to custom SVG icons

import React from 'react';
import {
    WoodIcon,
    RockIcon,
    WaterIcon,
    AppleIcon,
    PeachIcon,
    CookedAppleIcon,
    ScrapMetalIcon,
    IronIngotIcon,
    ComputerComponentIcon,
    AppleSeedIcon,
    CharcoalIcon,
    MetalDetectorIcon,
    StoneAxeIcon,
    RustyCanIcon,
    MutantMinnowIcon,
    RadPerchIcon,
    GoldenMinnowIcon,
    GlowingAlgaeIcon,
    ScrapIcon,
    FoodIcon,
    DrinkIcon,
    EnergyIcon,
    SilverIcon,
    HeartIcon,
    ExploreIcon,
    QuestIcon,
    InventoryIcon,
    CraftIcon,
    CharacterIcon,
    BaseIcon,
    FurnaceIcon,
    MarketIcon,
    FarmingIcon,
    FishingIcon,
    FactoryIcon,
    SkillsIcon,
    TechIcon,
    WastelandAutomataIcon,
} from '@/components/icons/CustomIcons';

// Resource and Item Icon Mapping
export const ITEM_ICONS: Record<string, React.FC<{ className?: string; size?: number }>> & {
    [key: string]: React.FC<{ className?: string; size?: number }>;
} = {
    // Basic Resources
    wood: WoodIcon,
    rock: RockIcon,
    stone: RockIcon,
    water: WaterIcon,

    // Food Items
    apple: AppleIcon,
    peach: PeachIcon,
    cookedApple: CookedAppleIcon,
    cookedPeach: CookedAppleIcon, // Reuse cooked apple style
    appleSeed: AppleSeedIcon,
    peachSeed: AppleSeedIcon,

    // Materials
    scrap: ScrapMetalIcon,
    scrapMetal: ScrapMetalIcon,
    iron: IronIngotIcon,
    ironIngot: IronIngotIcon,
    computerComponent: ComputerComponentIcon,
    component: ComputerComponentIcon,
    charcoal: CharcoalIcon,

    // Tools
    metalDetector: MetalDetectorIcon,
    stoneAxe: StoneAxeIcon,
    axe: StoneAxeIcon,

    // Junk/Misc
    rustyCan: RustyCanIcon,
    can: RustyCanIcon,

    // Fish
    mutantMinnow: MutantMinnowIcon,
    radPerch: RadPerchIcon,
    goldenMinnow: GoldenMinnowIcon,
    glowingAlgae: GlowingAlgaeIcon,
    algae: GlowingAlgaeIcon,

    // Generic
    scrapItem: ScrapIcon,
    junk: ScrapIcon,

    // Consumables
    food: FoodIcon,
    cannedFood: FoodIcon,
    drink: DrinkIcon,
    water_bottle: DrinkIcon,

    // Stats
    energy: EnergyIcon,
    silver: SilverIcon,
    money: SilverIcon,
    health: HeartIcon,
    hp: HeartIcon,
};

// UI Navigation Icon Mapping
export const NAV_ICONS: Record<string, React.FC<{ className?: string; size?: number }>> & {
    [key: string]: React.FC<{ className?: string; size?: number }>;
} = {
    explore: ExploreIcon,
    exploration: ExploreIcon,
    quests: QuestIcon,
    quest: QuestIcon,
    inventory: InventoryIcon,
    bag: InventoryIcon,
    craft: CraftIcon,
    crafting: CraftIcon,
    character: CharacterIcon,
    player: CharacterIcon,
    base: BaseIcon,
    home: BaseIcon,
    furnace: FurnaceIcon,
    smelting: FurnaceIcon,
    market: MarketIcon,
    shop: MarketIcon,
    farming: FarmingIcon,
    farm: FarmingIcon,
    hydroponics: FarmingIcon,
    fishing: FishingIcon,
    fish: FishingIcon,
    factory: FactoryIcon,
    machines: FactoryIcon,
    skills: SkillsIcon,
    skillTree: SkillsIcon,
    tech: TechIcon,
    technology: TechIcon,
    upgrades: TechIcon,
    logo: WastelandAutomataIcon,
    wasteland: WastelandAutomataIcon,
};

// Helper function to get icon by item ID
export const getItemIcon = (itemId: string): React.FC<{ className?: string; size?: number }> | null => {
    return ITEM_ICONS[itemId] || null;
};

// Helper function to get icon by navigation key
export const getNavIcon = (navKey: string): React.FC<{ className?: string; size?: number }> | null => {
    return NAV_ICONS[navKey] || null;
};

// Component wrapper for easy icon rendering
interface GameIconProps {
    type: 'item' | 'nav';
    id: string;
    size?: number;
    className?: string;
    fallback?: React.ReactNode;
}

export const GameIcon: React.FC<GameIconProps> = ({ type, id, size = 24, className = '', fallback = null }) => {
    const Icon = type === 'item' ? getItemIcon(id) : getNavIcon(id);

    if (!Icon) {
        return <>{fallback}</>;
    }

    return <Icon size={size} className={className} />;
};

// Export all icons for direct use
export {
    WoodIcon,
    RockIcon,
    WaterIcon,
    AppleIcon,
    PeachIcon,
    CookedAppleIcon,
    ScrapMetalIcon,
    IronIngotIcon,
    ComputerComponentIcon,
    AppleSeedIcon,
    CharcoalIcon,
    MetalDetectorIcon,
    StoneAxeIcon,
    RustyCanIcon,
    MutantMinnowIcon,
    RadPerchIcon,
    GoldenMinnowIcon,
    GlowingAlgaeIcon,
    ScrapIcon,
    FoodIcon,
    DrinkIcon,
    EnergyIcon,
    SilverIcon,
    HeartIcon,
    ExploreIcon,
    QuestIcon,
    InventoryIcon,
    CraftIcon,
    CharacterIcon,
    BaseIcon,
    FurnaceIcon,
    MarketIcon,
    FarmingIcon,
    FishingIcon,
    FactoryIcon,
    SkillsIcon,
    TechIcon,
    WastelandAutomataIcon,
};
