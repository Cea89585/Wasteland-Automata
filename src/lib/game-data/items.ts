// src/lib/game-data/items.ts
// This file now imports from the centralized JSON database
import { type Resource, type Item, type EquipmentSlot } from '@/lib/game-types';
import { ITEMS_DB } from '@/data/items';

// Export the item data from the centralized database
// This maintains backward compatibility with existing code
export const itemData: Record<Resource | Item, { name: string; description: string, equipSlot?: EquipmentSlot, sellPrice?: number }> & Record<string, { name: string; description: string, equipSlot?: EquipmentSlot, sellPrice?: number }> = ITEMS_DB as any;
