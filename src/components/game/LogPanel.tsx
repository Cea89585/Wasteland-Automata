// src/components/game/LogPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { Info, AlertTriangle, ShieldCheck, Hammer, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const logTypeIcons = {
  info: <Info className="h-4 w-4" />,
  event: <Info className="h-4 w-4" />,
  danger: <AlertTriangle className="h-4 w-4 text-destructive" />,
  success: <ShieldCheck className="h-4 w-4 text-green-500" />,
  craft: <Hammer className="h-4 w-4 text-accent" />,
};

const logTypeColors = {
  info: 'text-muted-foreground',
  event: 'text-foreground',
  danger: 'text-destructive',
  success: 'text-green-400',
  craft: 'text-accent-foreground',
}

export default function LogPanel() {
  const { gameState: { log } } = useGame();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [log]);

  return (
    <Card className="h-[400px] lg:h-full flex flex-col">
      <CardHeader>
        <CardTitle>Event Log</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="flex flex-col gap-3 pr-4">
            {log.slice(-5).reverse().map((message) => (
              <div key={message.id} className="flex items-start gap-3 text-sm animate-in fade-in-0 duration-500">
                <div className="pt-0.5">{logTypeIcons[message.type]}</div>
                <div className="flex-1">
                  <p className={cn(logTypeColors[message.type])}>{message.text}</p>
                  <div className="text-xs text-muted-foreground/50 flex items-center pt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
