import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlowIconProps extends React.ComponentProps<'svg'> {
    icon: LucideIcon;
    glowColor?: string;
    glowIntensity?: 'sm' | 'md' | 'lg';
}

export function GlowIcon({
    icon: Icon,
    className,
    glowColor = 'currentColor',
    glowIntensity = 'md',
    ...props
}: GlowIconProps) {

    const glowStyles = {
        sm: 'drop-shadow-[0_0_2px_rgba(var(--primary),0.5)]',
        md: 'drop-shadow-[0_0_5px_rgba(var(--primary),0.6)]',
        lg: 'drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]',
    };

    return (
        <div className="relative inline-flex items-center justify-center group">
            <Icon
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    glowStyles[glowIntensity],
                    "group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]",
                    className
                )}
                {...props}
            />
        </div>
    );
}
