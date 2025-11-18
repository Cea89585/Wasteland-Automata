// src/components/game/HelpPanel.tsx
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { itemData } from "@/lib/game-data/items";
import { locations } from "@/lib/game-data/locations";
import { statIcons, allIcons } from "./GameIcons";
import { BookOpen } from "lucide-react";
import type { Resource, Item } from "@/lib/game-types";

const gameBasics = {
    'Player Stats': 'Your core survival metrics. If Health reaches zero, you die.',
    'Exploration': 'The primary way to find a wide variety of resources. Costs energy.',
    'Scavenging': 'A less risky way to find basic survival items like food and water. Costs less energy.',
    'Base Building': 'Constructing structures at your base unlocks new technologies and automation.',
    'Crafting': 'Combining resources to create new tools, items, and structures.',
    'Tech Upgrades': 'Use Silver to purchase permanent upgrades for your character and base.',
    'Market': 'Sell your unwanted goods to the Wandering Trader for Silver.'
}

export default function HelpPanel() {
  const resources = Object.keys(itemData).filter(id => itemData[id as keyof typeof itemData].sellPrice !== undefined && id !== 'silver');
  const items = Object.keys(itemData).filter(id => itemData[id as keyof typeof itemData].equipSlot !== undefined || (itemData[id as keyof typeof itemData].sellPrice === undefined && id !== 'silver'));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BookOpen /> Help & Game Guide
        </CardTitle>
        <CardDescription>An overview of game mechanics and items.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Game Basics</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pr-4">
                {Object.entries(gameBasics).map(([title, desc]) => (
                    <div key={title} className="flex flex-col p-2 rounded-md bg-muted/50">
                        <span className="font-medium">{title}</span>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Player Stats</AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4 pr-4">
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        {statIcons.health}
                        <div>
                            <span className="font-medium">Health:</span>
                            <p className="text-sm text-muted-foreground">Your life force. Regenerates slowly when well-fed and hydrated. Reaching 0 is permanent death for this run.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        {statIcons.hunger}
                        <div>
                            <span className="font-medium">Hunger:</span>
                            <p className="text-sm text-muted-foreground">Decreases over time. Eat food to restore it. If it hits 0, you will start losing health.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        {statIcons.thirst}
                        <div>
                            <span className="font-medium">Thirst:</span>
                            <p className="text-sm text-muted-foreground">Decreases over time. Drink water to restore it. If it hits 0, you will start losing health.</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        {statIcons.energy}
                        <div>
                            <span className="font-medium">Energy:</span>
                            <p className="text-sm text-muted-foreground">Consumed when performing actions like exploring. Regenerates slowly over time or by resting.</p>
                        </div>
                    </div>
                </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Locations</AccordionTrigger>
            <AccordionContent>
               <div className="space-y-2 pr-4">
                {Object.values(locations).map(loc => (
                    <div key={loc.id} className="p-2 rounded-md bg-muted/50">
                        <p><span className="font-medium">{loc.name}:</span> {loc.description}</p>
                    </div>
                ))}
               </div>
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="item-4">
            <AccordionTrigger>Resources</AccordionTrigger>
            <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-4">
                    {resources.map(id => {
                        const data = itemData[id as keyof typeof itemData];
                        return (
                            <div key={id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                                {allIcons[id]}
                                <div>
                                    <span className="font-medium">{data.name}</span>
                                    <p className="text-sm text-muted-foreground">{data.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>Craftable Items & Structures</AccordionTrigger>
            <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-4">
                    {items.map(id => {
                        const data = itemData[id as keyof typeof itemData];
                        return (
                            <div key={id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                                {allIcons[id]}
                                <div>
                                    <span className="font-medium">{data.name}</span>
                                    <p className="text-sm text-muted-foreground">{data.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
