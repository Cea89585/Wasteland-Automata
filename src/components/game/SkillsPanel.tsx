import React, { useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { skills, skillCategories, getSkillLevel, canUnlockSkill, SkillCategory } from '@/lib/game-data/skills';
import { Lock, Check, Star } from 'lucide-react';

export default function SkillsPanel() {
    const { gameState, dispatch } = useGame();
    const { skills: playerSkills, upgradePoints, builtStructures } = gameState;
    const [activeCategory, setActiveCategory] = useState<SkillCategory>('crafting');

    const handleUnlock = (skillId: string) => {
        dispatch({ type: 'UNLOCK_SKILL', payload: { skillId } });
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Skills & Perks</CardTitle>
                            <CardDescription>Spend upgrade points to unlock quality-of-life improvements.</CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                            <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
                            {upgradePoints} Points
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as SkillCategory)} className="w-full">
                        <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-4 h-auto">
                            {Object.entries(skillCategories).map(([key, { name, icon }]) => (
                                <TabsTrigger key={key} value={key} className="flex flex-col gap-1 py-2 h-auto">
                                    <span className="text-xl">{icon}</span>
                                    <span className="text-xs hidden sm:inline">{name.split(' ')[0]}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {Object.keys(skillCategories).map((categoryKey) => (
                            <TabsContent key={categoryKey} value={categoryKey}>
                                <ScrollArea className="h-[500px] pr-4">
                                    <div className="space-y-4">
                                        {skills
                                            .filter((s) => s.category === categoryKey)
                                            .map((skill) => {
                                                const currentLevel = getSkillLevel(playerSkills, skill.id);
                                                const isMaxed = currentLevel >= skill.maxLevel;
                                                const { canUnlock, reason } = canUnlockSkill(playerSkills, skill.id, upgradePoints, builtStructures);

                                                return (
                                                    <Card key={skill.id} className={`border-l-4 ${isMaxed ? 'border-l-green-500' : canUnlock ? 'border-l-blue-500' : 'border-l-gray-300'}`}>
                                                        <CardContent className="p-4">
                                                            <div className="flex justify-between items-start gap-4">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h3 className="font-semibold text-lg">{skill.name}</h3>
                                                                        <div className="flex gap-1">
                                                                            {Array.from({ length: skill.maxLevel }).map((_, i) => (
                                                                                <div
                                                                                    key={i}
                                                                                    className={`w-2 h-2 rounded-full ${i < currentLevel ? 'bg-primary' : 'bg-muted'}`}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground mb-2">{skill.description}</p>

                                                                    {skill.requiresStructure && !builtStructures.includes(skill.requiresStructure) && (
                                                                        <p className="text-xs text-yellow-600 flex items-center gap-1">
                                                                            <Lock className="w-3 h-3" /> Requires {skill.requiresStructure}
                                                                        </p>
                                                                    )}

                                                                    {skill.prerequisites && (
                                                                        <div className="flex gap-2 mt-2">
                                                                            {skill.prerequisites.map(prereqId => {
                                                                                const prereq = skills.find(s => s.id === prereqId);
                                                                                const prereqLevel = getSkillLevel(playerSkills, prereqId);
                                                                                return (
                                                                                    <Badge key={prereqId} variant={prereqLevel > 0 ? "outline" : "secondary"} className="text-xs">
                                                                                        Requires: {prereq?.name}
                                                                                    </Badge>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-col items-end gap-2">
                                                                    {isMaxed ? (
                                                                        <Badge variant="default" className="bg-green-600">
                                                                            <Check className="w-3 h-3 mr-1" /> Maxed
                                                                        </Badge>
                                                                    ) : (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleUnlock(skill.id)}
                                                                            disabled={!canUnlock}
                                                                            className="min-w-[100px]"
                                                                        >
                                                                            {canUnlock ? (
                                                                                <>Unlock (1 Pt)</>
                                                                            ) : (
                                                                                <><Lock className="w-3 h-3 mr-1" /> Locked</>
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                    {!isMaxed && !canUnlock && reason !== 'Not enough upgrade points' && (
                                                                        <span className="text-xs text-destructive">{reason}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
