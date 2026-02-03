// src/components/game/HelpPanel.tsx
'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, AlertTriangle, Hammer, Gauge, Info } from "lucide-react";

export default function HelpPanel() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="text-primary" /> Survivor&apos;s Guide
                </CardTitle>
                <CardDescription>Essential knowledge for surviving the wasteland.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">

                    <AccordionItem value="basics">
                        <AccordionTrigger className="text-lg font-semibold">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" /> Survival Basics
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 text-muted-foreground">
                            <p>
                                <strong className="text-primary">Health</strong> is your life. If it hits 0, you lose everything. Keep it high by eating, drinking, and resting.
                            </p>
                            <p>
                                <strong className="text-primary">Energy</strong> is required for every action.
                                It regenerates slowly over time, or quickly by <strong className="text-foreground">Resting</strong>.
                            </p>
                            <div className="bg-muted/50 p-3 rounded-md border-l-4 border-yellow-500">
                                <p className="text-sm italic">"Don&apos;t starve. Don&apos;t dehydrate. Don&apos;t get eaten by mutants." - Wasteland Rule #1</p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="getting-started">
                        <AccordionTrigger className="text-lg font-semibold">
                            <div className="flex items-center gap-2">
                                <Gauge className="h-5 w-5 text-blue-500" /> Getting Started
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 text-muted-foreground">
                            <ol className="list-decimal pl-5 space-y-2">
                                <li>
                                    <strong className="text-foreground">Scavenge</strong> for basic supplies like Water and Apples to stay alive.
                                </li>
                                <li>
                                    <strong className="text-foreground">Explore</strong> the Outskirts to find Wood and Stone. You&apos;ll need these for tools.
                                </li>
                                <li>
                                    Use the <strong className="text-foreground">Crafting</strong> panel to make a <strong className="text-primary">Stone Axe</strong>. This lets you Chop Wood efficiently.
                                </li>
                                <li>
                                    Build a <strong className="text-primary">Workbench</strong> in the Base tab. This unlocks advanced crafting recipes.
                                </li>
                            </ol>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="crafting">
                        <AccordionTrigger className="text-lg font-semibold">
                            <div className="flex items-center gap-2">
                                <Hammer className="h-5 w-5 text-orange-500" /> Crafting & Progression
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 text-muted-foreground">
                            <p>
                                Most items require a <strong>Workbench</strong> to craft. Once you have one, you can make:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>Tools:</strong> Pickaxes, Fishing Rods, and Weapons to access new resources.</li>
                                <li><strong>Structures:</strong> Furnaces, Water Purifiers, and Farms to automate your survival.</li>
                                <li><strong>Machines:</strong> Drill rigs and auto-smelters to do the work for you.</li>
                            </ul>
                            <p className="mt-2 text-sm">
                                <strong>Tip:</strong> If you can&apos;t find a resource, check the <strong className="text-foreground">Explore</strong> panel. Different locations yield different items.
                            </p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="tips">
                        <AccordionTrigger className="text-lg font-semibold">
                            <div className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-green-500" /> Pro Tips
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 text-muted-foreground">
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Sell excess items to the <strong>Wandering Trader</strong> (Market) for Silver.</li>
                                <li>Use Silver to buy <strong>Upgrades</strong> like larger inventory or faster automation.</li>
                                <li><strong>Fishing</strong> is a great source of food and valuable fish to sell.</li>
                                <li>Check the <strong>Collection</strong> page in Settings to see what items you're missing!</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
            </CardContent>
        </Card>
    );
}
