// src/components/game/LogPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { Info, AlertTriangle, ShieldCheck, Hammer, Clock, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '../ui/button';
import { allIcons } from './GameIcons';


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

const LogEntry = ({ message }: { message: ReturnType<typeof useGame>['gameState']['log'][0] }) => {
    let icon = logTypeIcons[message.type];

    if (message.type === 'craft' && message.item) {
        icon = allIcons[message.item] || logTypeIcons.craft;
    }
  
  return (
  <div className="flex items-start gap-3 text-sm animate-in fade-in-0 duration-500">
    <div className="pt-0.5">{icon}</div>
    <div className="flex-1">
      <p className={cn(logTypeColors[message.type])}>{message.text}</p>
      <div className="text-xs text-muted-foreground/50 flex items-center pt-1">
        <Clock className="h-3 w-3 mr-1" />
        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
      </div>
    </div>
  </div>
)};

export default function LogPanel() {
  const { gameState: { log } } = useGame();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = 0; // Scroll to the top
        }
    }
  }, [log]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Event Log</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              View All
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Full Event Log</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] mt-4">
              <div className="flex flex-col gap-3 pr-4">
                {log.slice().reverse().map((message) => (
                  <LogEntry key={message.id} message={message} />
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden h-[300px]">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="flex flex-col gap-3 pr-4">
            {log.slice().reverse().map((message) => (
              <LogEntry key={message.id} message={message} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
