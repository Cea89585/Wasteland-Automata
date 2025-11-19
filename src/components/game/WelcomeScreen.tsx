
// src/components/game/WelcomeScreen.tsx
'use client';
import { useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, User, Wand } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firstNames, surnames } from '@/lib/game-data/names';
import filter from 'naughty-words';

export default function WelcomeScreen() {
    const { dispatch } = useGame();
    const [name, setName] = useState('');
    const { toast } = useToast();

    const handleSave = () => {
        if (name.trim().length < 3 || name.trim().length > 25) {
            toast({ variant: 'destructive', title: 'Invalid Name', description: 'Name must be between 3 and 25 characters.' });
            return;
        }
        
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            toast({ variant: 'destructive', title: 'Invalid Name', description: 'Name can only contain letters and spaces.' });
            return;
        }

        const sanitizedName = name.replace(/\s+/g, '').toLowerCase();
        const isProfane = filter.en.some((word: string) => sanitizedName.includes(word.toLowerCase()));

        if (isProfane) {
            toast({ variant: 'destructive', title: 'Name Not Allowed', description: 'Please choose a more appropriate name.' });
            return;
        }

        dispatch({ type: 'SET_CHARACTER_NAME', payload: name.trim() });
        toast({ title: 'Welcome to the Wasteland', description: `Your journey as ${name.trim()} begins now.` });
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
                        Before you venture into the wasteland, tell us your name.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                    <Input 
                        placeholder="Enter your character's name..."
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        maxLength={25}
                    />
                    <Button size="icon" variant="outline" onClick={handleRandomize} aria-label="Randomize Name">
                        <RefreshCw />
                    </Button>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleSave} disabled={name.trim().length < 3}>
                        <Wand className="mr-2" />
                        Begin Journey
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}
