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
import { doc, getDoc, writeBatch } from 'firebase/firestore';

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
        
        if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
            toast({ variant: 'destructive', title: 'Invalid Name', description: 'Name can only contain letters and spaces.' });
            return;
        }

        const sanitizedName = trimmedName.replace(/\s+/g, ' ').toLowerCase();
        const isProfane = filter.en.some((word: string) => sanitizedName.includes(word.toLowerCase()));

        if (isProfane) {
            toast({ variant: 'destructive', title: 'Name Not Allowed', description: 'Please choose a more appropriate name.' });
            return;
        }
        
        setIsLoading(true);

        const nameRef = doc(firestore, 'characterNames', sanitizedName);
        const userRef = doc(firestore, 'users', user.uid);

        try {
            const nameDoc = await getDoc(nameRef);
            if (nameDoc.exists()) {
                toast({ variant: 'destructive', title: 'Name Taken', description: 'This name is already in use. Please choose another.' });
                setIsLoading(false);
                return;
            }

            // Use a batch to ensure atomicity
            const batch = writeBatch(firestore);
            
            // Claim the name
            batch.set(nameRef, { uid: user.uid });
            
            // Update the user's character profile
            batch.update(userRef, { characterName: trimmedName });

            await batch.commit();
            
            // Dispatch is now handled by the onSnapshot listener in GameContext
            toast({ title: 'Welcome to the Wasteland', description: `Your journey as ${trimmedName} begins now.` });

        } catch (error: any) {
            // This is a generic catch-all for other errors (like network issues)
            // The specific permission error will be handled by the .catch on the commit itself.
            if (error.code !== 'permission-denied') {
                 toast({ variant: 'destructive', title: 'Error', description: 'Could not set character name. Please try again.' });
            }
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
