// src/components/ui/sprite-icon.tsx
// New icon component that uses SVG sprites for better performance and easier icon management

import React from 'react';

interface SpriteIconProps {
    /** Icon name (without 'icon-' prefix) */
    name: string;
    /** Size in pixels */
    size?: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * SpriteIcon component - uses SVG sprites for optimal performance
 * 
 * Benefits:
 * - All icons loaded once (better performance)
 * - Easy to swap out entire icon set
 * - Smaller bundle size
 * - No component imports needed
 * 
 * Usage:
 * <SpriteIcon name="wood" size={24} />
 * <SpriteIcon name="fish" size={32} className="text-blue-500" />
 */
export const SpriteIcon: React.FC<SpriteIconProps> = ({
    name,
    size = 24,
    className = ''
}) => {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            aria-hidden="true"
        >
            <use href={`/icons/sprite.svg#icon-${name}`} />
        </svg>
    );
};

export default SpriteIcon;
