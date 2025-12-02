import React from 'react';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Factory, Zap, Fuel, Lock } from 'lucide-react';
import type { MachineType, Resource } from '@/lib/game-types';
import { machineCosts } from '@/lib/game-data/machines';
import { itemData } from '@/lib/game-data/items';

export default function FactoryPanel() {
    const { gameState, dispatch } = useGame();
    const { machines, powerCapacity, powerConsumption, inventory, builtStructures } = gameState;

    const handleBuildMachine = (type: MachineType) => {
        dispatch({ type: 'BUILD_MACHINE', payload: { type } });
    };

    const handleAddFuel = (machineId: string, fuelType: Resource) => {
        dispatch({ type: 'ADD_MACHINE_FUEL', payload: { machineId, fuelType } });
    };

    const canAfford = (type: MachineType) => {
        const cost = machineCosts[type].cost;
        return Object.entries(cost).every(([resource, amount]) =>
            (inventory[resource as Resource] || 0) >= amount
        );
    };

    const isUnlocked = (type: MachineType) => {
        return machineCosts[type].unlockedBy.every(req => builtStructures.includes(req));
    };

    const powerPercentage = powerCapacity > 0 ? Math.min(100, (powerConsumption / powerCapacity) * 100) : 0;
    const isPowered = powerCapacity >= powerConsumption;

    return (
        <div className="space-y-4">
            {/* Power Grid Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Power Grid
                    </CardTitle>
                    <CardDescription>
                        {isPowered ? 'Grid is operational' : 'Insufficient power - machines offline'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Consumption: {powerConsumption} MW</span>
                            <span>Capacity: {powerCapacity} MW</span>
                        </div>
                        <Progress value={powerPercentage} className={`h-3 ${!isPowered ? 'bg-red-200' : ''}`} />
                        {!isPowered && powerConsumption > 0 && (
                            <p className="text-xs text-destructive mt-2">
                                ⚠️ Build more Biomass Burners and add fuel to increase power capacity
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Build Machines */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Factory className="h-5 w-5" />
                        Build Machines
                    </CardTitle>
                    <CardDescription>
                        Construct automated machines to process resources
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {Object.values(machineCosts).map((machineData) => {
                            const unlocked = isUnlocked(machineData.type);
                            const affordable = canAfford(machineData.type);
                            const canBuild = unlocked && affordable;

                            return (
                                <div key={machineData.type} className="border rounded-lg p-3 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium">{machineData.name}</h4>
                                                {!unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{machineData.description}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleBuildMachine(machineData.type)}
                                            disabled={!canBuild}
                                        >
                                            Build
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {Object.entries(machineData.cost).map(([resource, amount]) => {
                                            const has = inventory[resource as Resource] || 0;
                                            const enough = has >= amount;
                                            return (
                                                <span key={resource} className={enough ? 'text-green-600' : 'text-red-600'}>
                                                    {itemData[resource as Resource].name}: {has}/{amount}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    {!unlocked && (
                                        <p className="text-xs text-yellow-600">
                                            🔒 Requires: {machineData.unlockedBy.join(', ')}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Machine List */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Machines ({machines.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {machines.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No machines built yet. Build your first machine above!</p>
                    ) : (
                        <div className="space-y-2">
                            {machines.map((machine) => {
                                const statusColor =
                                    machine.status === 'running' ? 'bg-green-500' :
                                        machine.status === 'no_power' ? 'bg-red-500' :
                                            machine.status === 'no_fuel' ? 'bg-orange-500' :
                                                'bg-yellow-500';

                                const statusText =
                                    machine.status === 'running' ? 'Running' :
                                        machine.status === 'no_power' ? 'No Power' :
                                            machine.status === 'no_fuel' ? 'No Fuel' :
                                                'Idle';

                                return (
                                    <Card key={machine.id} className="bg-secondary/20">
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${statusColor}`} />
                                                    <div>
                                                        <p className="font-medium text-sm capitalize">{machineCosts[machine.type].name}</p>
                                                        <p className="text-xs text-muted-foreground">{statusText}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {machine.type === 'biomassBurner' ? '+10 MW' : '-5 MW'}
                                                </Badge>
                                            </div>

                                            {/* Fuel controls for Biomass Burner */}
                                            {machine.type === 'biomassBurner' && (
                                                <div className="space-y-2 mt-3 pt-3 border-t">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Fuel Level:</span>
                                                        <span>{machine.fuelLevel} ticks</span>
                                                    </div>
                                                    <Progress value={Math.min(100, (machine.fuelLevel / 100) * 100)} className="h-2" />
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1 text-xs h-7"
                                                            onClick={() => handleAddFuel(machine.id, 'wood')}
                                                            disabled={!inventory.wood || inventory.wood <= 0}
                                                        >
                                                            <Fuel className="h-3 w-3 mr-1" />
                                                            Wood (+10)
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1 text-xs h-7"
                                                            onClick={() => handleAddFuel(machine.id, 'charcoal')}
                                                            disabled={!inventory.charcoal || inventory.charcoal <= 0}
                                                        >
                                                            <Fuel className="h-3 w-3 mr-1" />
                                                            Charcoal (+50)
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1 text-xs h-7"
                                                            onClick={() => handleAddFuel(machine.id, 'biomass')}
                                                            disabled={!inventory.biomass || inventory.biomass <= 0}
                                                        >
                                                            <Fuel className="h-3 w-3 mr-1" />
                                                            Biomass (+100)
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
