// src/components/game/WelcomeScreen.tsx
'use client';
import { useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, User, Wand, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firstNames, surnames } from '@/lib/game-data/names';
import filter from 'naughty-words';
import { useFirebase } from '@/firebase/provider';
import { useUser } from '@/hooks/use-user';
import { doc, getDoc, writeBatch, updateDoc } from 'firebase/firestore';

export default function WelcomeScreen() {
    const { dispatch } = useGame();
    const { firestore } = useFirebase();
    const { user } = useUser();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSave = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }

        const trimmedName = name.trim();
        if (trimmedName.length < 3 || trimmedName.length > 25) {
            toast({ variant: 'destructive', title: 'Invalid Name', description: 'Name must be between 3 and 25 characters.' });
            return;
        }
        await updateDoc(userRef, { characterName: trimmedName });

        // The onSnapshot listener in GameContext will handle updating the rest of the state.
        toast({ title: 'Welcome to the Wasteland', description: `Your journey as ${trimmedName} begins now.` });

    } catch (error: any) {
        console.error('WelcomeScreen: Save failed', error);
        // Revert local state if save fails
        dispatch({ type: 'SET_CHARACTER_NAME', payload: 'Survivor' });

        toast({ variant: 'destructive', title: 'Error', description: 'Could not set character name. Please try again.' });
    } finally {
        setIsLoading(false);
    }
};

const handleRandomize = () => {
    const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];
    setName(`${randomFirstName} ${randomSurname}`);
};

return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4">
        <div
            className="absolute inset-0 bg-background -z-10"
            style={{
                backgroundImage: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%), radial-gradient(circle at bottom left, hsl(var(--accent) / 0.1), transparent 50%)'
            }}
        />
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <User /> Who are you?
                </CardTitle>
                <CardDescription>
                    Before you venture into the wasteland, tell us your name. This name will be unique to you.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
                <Input
                    placeholder="Enter your character's name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={25}
                    disabled={isLoading}
                />
                <Button size="icon" variant="outline" onClick={handleRandomize} aria-label="Randomize Name" disabled={isLoading}>
                    <RefreshCw />
                </Button>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleSave} disabled={name.trim().length < 3 || isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 animate-spin" />
                            Checking availability...
                        </>
                    ) : (
                        <>
                            <Wand className="mr-2" />
                            Begin Journey
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    </main>
);
}
