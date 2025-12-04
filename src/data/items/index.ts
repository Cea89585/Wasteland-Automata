// src/data/items/index.ts
// Centralized item database - combines all item JSON files

import resourcesData from './resources.json';
import fishData from './fish.json';
import equipmentData from './equipment.json';

// Combine all item data into a single database
export const ITEMS_DB = {
    ...resourcesData,
    ...fishData,
    ...equipmentData
} as const;

// Type definitions
export interface ItemData {
    id: string;
    type: 'resource' | 'fish' | 'junk' | 'equipment' | 'structure' | 'consumable' | 'item';
    name: string;
    description: string;
    icon: string;
    sellPrice?: number;
    equipSlot?: 'hand' | 'body' | 'head';
}

// Helper functions for accessing item data
export const getItem = (id: string): ItemData | undefined => {
    return ITEMS_DB[id as keyof typeof ITEMS_DB] as ItemData | undefined;
};

export const getAllItems = (): ItemData[] => {
    return Object.values(ITEMS_DB) as ItemData[];
};

export const getItemsByType = (type: string): ItemData[] => {
    return getAllItems().filter(item => item.type === type);
};

export const getItemName = (id: string): string => {
    return getItem(id)?.name || id;
};

export const getItemDescription = (id: string): string => {
    return getItem(id)?.description || '';
};

export const getItemSellPrice = (id: string): number | undefined => {
    return getItem(id)?.sellPrice;
};

export const getItemIcon = (id: string): string => {
    return getItem(id)?.icon || 'default';
};

// Export types
export type ItemId = keyof typeof ITEMS_DB;
export type ItemDatabase = typeof ITEMS_DB;
