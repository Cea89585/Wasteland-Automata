
// src/components/game/LogPanel.tsx
'use client';
import { useGame } from '@/hooks/use-game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { Info, AlertTriangle, ShieldCheck, Hammer, Clock, BookOpen, Trash2, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
  craft: 'text-accent',
}

const LogEntry = ({ message }: { message: ReturnType<typeof useGame>['gameState']['log'][0] }) => {
    let icon = logTypeIcons[message.type];
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (message.type === 'craft' && message.item) {
        icon = allIcons[message.item] || logTypeIcons.craft;
    }

    const isCollapsible = message.text.includes('\n') || message.text.length > 100;
  
    return (
        <div className="flex items-start gap-3 text-sm animate-in fade-in-0 duration-500">
            <div className="pt-0.5">{icon}</div>
            <div className="flex-1">
                <p
                    className={cn(
                        logTypeColors[message.type], 
                        "whitespace-pre-wrap",
                        isCollapsible && !isExpanded && "line-clamp-2"
                    )}
                >
                    {message.text}
                </p>
                
                {isCollapsible && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)} 
                        className="text-xs text-primary hover:underline mt-1 flex items-center"
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                )}

                <div className="text-xs text-muted-foreground/50 flex items-center pt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                </div>
            </div>
        </div>
    );
};

export default function LogPanel() {
  const { gameState: { log }, dispatch } = useGame();
  
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
            <div className="mt-4 h-[60vh] -mx-6 px-6 overflow-y-auto">
                <div className="flex flex-col gap-3 pr-4">
                    {[...log].reverse().map((message) => (
                    <LogEntry key={message.id} message={message} />
                    ))}
                </div>
            </div>
             <DialogFooter className="mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your log history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => dispatch({ type: 'CLEAR_LOG' })}>
                        Yes, clear history
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                 <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                 </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 pr-4">
          {log.slice(0, 15).map((message) => (
            <LogEntry key={message.id} message={message} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
