'use client';

import { GameProvider } from '@/contexts/game-context';
import GameUI from '@/components/game/GameUI';

export default function Home() {
  return (
    <GameProvider>
      <main className="relative min-h-screen w-full overflow-x-hidden">
        <div 
          className="absolute inset-0 bg-background -z-10"
          style={{
            backgroundImage: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%), radial-gradient(circle at bottom left, hsl(var(--accent) / 0.1), transparent 50%)'
          }}
        />
        <div className="container mx-auto p-2 sm:p-4">
          <GameUI />
        </div>
      </main>
    </GameProvider>
  );
}
