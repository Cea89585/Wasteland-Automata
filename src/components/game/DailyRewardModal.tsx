import React, { useState, useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';

export default function DailyRewardModal() {
    const { gameState, dispatch } = useGame();
    const [isOpen, setIsOpen] = useState(false);
    const [canClaim, setCanClaim] = useState(false);

    useEffect(() => {
        const checkDaily = () => {
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            const isAvailable = now - gameState.lastDailyRewardClaimed >= oneDay;
            setCanClaim(isAvailable);

            // Auto-open if available and not recently closed (simple logic: just check availability)
            // Ideally we'd have a "hasSeenDailyModal" session state, but for now let's just show a button in UI
            // or auto-open once. Let's stick to a button in the UI that glows, and this modal opens when clicked.
            // Actually, let's make it auto-open on load if available.
        };

        checkDaily();
        const interval = setInterval(checkDaily, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [gameState.lastDailyRewardClaimed]);

    // We'll control open state from parent or just have a button trigger it.
    // For now, let's export a component that includes the button AND the dialog.

    const handleClaim = () => {
        dispatch({ type: 'CLAIM_DAILY_REWARD' });
        setIsOpen(false);
    };

    if (!canClaim && !isOpen) return null;

    return (
        <>
            {canClaim && (
                <Button
                    variant="outline"
                    className="fixed bottom-4 right-4 z-50 animate-bounce shadow-lg border-yellow-500 text-yellow-500 hover:text-yellow-400 hover:border-yellow-400"
                    onClick={() => setIsOpen(true)}
                >
                    <Gift className="mr-2 h-4 w-4" />
                    Daily Reward Available!
                </Button>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Gift className="h-5 w-5 text-yellow-500" />
                            Daily Supply Drop
                        </DialogTitle>
                        <DialogDescription>
                            A supply crate has been located nearby. Claim it to receive resources and silver.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-center">
                        <p className="text-lg font-semibold text-primary">50 Silver</p>
                        <p className="text-sm text-muted-foreground">+ Random Resource Bundle</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleClaim} className="w-full">Claim Rewards</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
