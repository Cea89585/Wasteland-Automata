// src/components/game/LoadingScreen.tsx
import { Loader } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <Loader className="h-12 w-12 animate-spin text-primary" />
      <h1 className="text-2xl font-headline font-semibold">Wasteland Automata</h1>
      <p className="text-muted-foreground">Loading save data...</p>
    </div>
  );
}
