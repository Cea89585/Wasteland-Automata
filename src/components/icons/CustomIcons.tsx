// Complete Custom SVG Icons for Wasteland Automata
import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
}

// RESOURCES
export const WoodIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect fill="#9C6B3A" x="0" y="0" width="64" height="64" /><path d="M0,10 Q16,6 32,8 T64,10 L64,14 Q48,18 32,14 T0,14 Z" fill="#7B5530" /><path d="M0,26 Q16,22 32,24 T64,26 L64,30 Q48,34 32,30 T0,30 Z" fill="#7B5530" /><path d="M0,42 Q16,38 32,40 T64,42 L64,46 Q48,50 32,46 T0,46 Z" fill="#7B5530" /><circle cx="18" cy="20" r="4" fill="#5D3F1F" /><circle cx="48" cy="45" r="3.5" fill="#5D3F1F" /></svg>
);

export const RockIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M32,8 Q52,14 58,28 Q60,42 52,52 Q42,62 28,60 Q14,56 10,42 Q6,28 18,16 Q24,10 32,8 Z" fill="#6B7280" /><path d="M32,8 Q40,10 46,16 Q52,22 52,32 Q50,42 44,48 Q38,52 32,50 Q26,48 22,42 Q18,34 22,24 Q26,14 32,10 Z" fill="#9CA3AF" opacity="0.4" /><circle cx="28" cy="18" r="1.5" fill="#E5E7EB" /></svg>
);

export const WaterIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect fill="#3B82F6" x="0" y="0" width="64" height="64" rx="12" /><path d="M0,16 Q16,8 32,12 T64,16 L64,64 L0,64 Z" fill="#60A5FA" opacity="0.7" /><path d="M0,28 Q16,20 32,24 T64,28 L64,64 L0,64 Z" fill="#93BBFB" opacity="0.5" /><circle cx="18" cy="48" r="3" fill="#FFFFFF" opacity="0.5" /></svg>
);

export const AppleIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M42,12 Q52,20 52,32 Q52,48 44,56 Q36,62 32,62 Q28,62 20,56 Q12,48 12,32 Q12,20 20,14 Q26,10 32,10 Q36,10 42,12 Z" fill="#EF4444" /><path d="M42,12 Q48,18 48,28 Q48,38 42,46 Q36,52 32,52 Q28,52 24,48 Q18,40 20,28 Q22,18 32,16 Q38,16 42,12 Z" fill="#F87171" opacity="0.7" /><path d="M40,10 Q46,6 50,10 Q52,14 48,16 Q44,18 40,14 Q38,12 40,10 Z" fill="#22C55E" /><circle cx="38" cy="22" r="3" fill="#FFFFFF" opacity="0.6" /></svg>
);

export const PeachIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M32,10 Q48,18 50,32 Q50,50 38,58 Q32,62 26,58 Q14,50 14,32 Q14,18 30,12 Q32,10 32,10 Z" fill="#FCA5A5" /><path d="M32,10 Q44,16 46,28 Q46,42 38,52 Q32,56 26,52 Q18,42 20,28 Q22,16 32,12 Z" fill="#FECACA" opacity="0.8" /><path d="M38,8 Q44,4 48,8 Q50,12 46,14 Q42,16 38,12 Q36,10 38,8 Z" fill="#22C55E" /><path d="M34,14 Q36,20 36,32 Q36,44 32,52" stroke="#F47272" strokeWidth="2" opacity="0.7" /></svg>
);

export const CookedAppleIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M42,12 Q52,20 52,32 Q52,48 44,56 Q36,62 32,62 Q28,62 20,56 Q12,48 12,32 Q12,20 20,14 Q26,10 32,10 Q36,10 42,12 Z" fill="#C2410C" /><path d="M42,14 Q48,22 48,32 Q48,44 40,52 Q34,56 30,54 Q24,50 22,42 Q20,30 26,20 Q30,14 42,14 Z" fill="#EA580C" opacity="0.7" /><path d="M40,10 Q46,6 50,10 Q52,14 48,16 Q44,18 40,14 Q38,12 40,10 Z" fill="#78716C" /></svg>
);

export const ScrapMetalIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M14,18 L8,32 Q10,48 20,56 L38,60 Q50,56 54,44 L58,28 Q54,16 44,12 L26,10 Q18,12 14,18 Z" fill="#64748B" /><path d="M18,24 Q24,20 32,22 Q40,26 44,34 L40,46 Q32,50 24,46 Z" fill="#78716C" opacity="0.6" /><path d="M16,20 L28,24 L36,20" stroke="#E2E8F0" strokeWidth="3" opacity="0.8" /></svg>
);

export const IronIngotIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect x="8" y="16" width="48" height="32" rx="6" fill="#374151" /><path d="M10,16 L14,12 L50,12 L54,16 Z" fill="#4B5563" /><path d="M14,12 L14,52 L10,48 L10,16 Z" fill="#2D3748" /><rect x="14" y="16" width="36" height="4" fill="#94A3B8" opacity="0.6" /><circle cx="52" cy="14" r="4" fill="#F97316" opacity="0.3" /></svg>
);

export const ComputerComponentIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect x="12" y="12" width="40" height="40" rx="4" fill="#0F172A" /><rect x="8" y="8" width="48" height="48" rx="6" fill="#1E293B" /><rect x="8" y="20" width="4" height="24" fill="#F59E0B" /><rect x="52" y="20" width="4" height="24" fill="#F59E0B" /><path d="M20,20 L44,20 L44,28 L28,28 L28,36 L40,36" stroke="#0EA5E9" strokeWidth="2" /><circle cx="28" cy="28" r="2" fill="#22D3EE" opacity="0.9" /></svg>
);

export const AppleSeedIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><circle cx="32" cy="32" r="28" fill="#FEF3C7" opacity="0.4" /><path d="M32,18 Q28,14 25,16 Q23,18 25,22 Q28,24 32,22 Q36,24 39,22 Q41,18 39,16 Q36,14 32,18 Z" fill="#451A03" /><path d="M32,46 Q28,50 25,48 Q23,46 25,42 Q28,40 32,42 Q36,40 39,42 Q41,46 39,48 Q36,50 32,46 Z" fill="#451A03" /><path d="M18,32 Q14,36 16,39 Q18,41 22,39 Q24,36 22,32 Q24,28 22,26 Q18,24 16,26 Q14,29 18,32 Z" fill="#451A03" /></svg>
);

export const CharcoalIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M16,20 L10,32 Q12,48 24,56 L42,58 Q52,52 54,38 L50,24 Q46,14 36,12 L22,14 Q18,16 16,20 Z" fill="#1C1917" /><path d="M20,24 Q28,20 36,26 Q44,32 42,42 L34,50 Q26,48 22,40 Z" fill="#292524" opacity="0.8" /><circle cx="24" cy="32" r="3" fill="#F97316" opacity="0.7" /><circle cx="24" cy="32" r="1.5" fill="#FCA5A5" /></svg>
);

// TOOLS & ITEMS
export const MetalDetectorIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect x="28" y="4" width="8" height="40" rx="4" fill="#374151" /><rect x="24" y="4" width="16" height="12" rx="6" fill="#64748B" /><rect x="20" y="16" width="24" height="16" rx="4" fill="#0F172A" /><rect x="26" y="20" width="12" height="8" rx="1" fill="#22D3EE" opacity="0.7" /><ellipse cx="32" cy="54" rx="20" ry="8" fill="#64748B" /><circle cx="32" cy="50" r="12" stroke="#0EA5E9" strokeWidth="2" fill="none" opacity="0.6" /></svg>
);

export const StoneAxeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect x="28" y="8" width="8" height="48" rx="4" fill="#92400E" /><path d="M18,12 Q12,24 18,36 Q24,44 32,48 L32,56 L40,48 Q48,44 54,36 Q60,24 54,12 Q48,6 32,8 L32,16 Q24,14 18,12 Z" fill="#6B7280" /><path d="M32,48 L32,56 L40,48" fill="#9CA3AF" opacity="0.6" /></svg>
);

export const RustyCanIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect x="16" y="12" width="32" height="40" rx="4" fill="#475569" /><path d="M20,16 Q28,14 36,18 Q40,24 38,32 Q36,40 28,42 Q20,40 20,32 Q20,24 20,16 Z" fill="#92400E" opacity="0.7" /><ellipse cx="32" cy="12" rx="16" ry="4" fill="#64748B" /><ellipse cx="32" cy="52" rx="16" ry="4" fill="#374151" /></svg>
);

// FISH
export const MutantMinnowIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M20,20 Q8,32 12,44 Q20,56 36,52 Q52,48 56,40 Q52,32 44,28 Q36,24 20,20 Z" fill="#86EFAC" /><circle cx="24" cy="30" r="5" fill="#1E293B" /><circle cx="25" cy="29" r="2.5" fill="#FFFFFF" /><circle cx="32" cy="24" r="3" fill="#1E293B" /><circle cx="18" cy="38" r="2.5" fill="#1E293B" /><path d="M52,32 Q60,28 62,32 Q60,36 52,36 Q48,40 44,36 Q48,32 52,32 Z" fill="#22C55E" /></svg>
);

export const RadPerchIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M14,20 Q6,32 14,44 Q24,56 44,52 Q56,48 58,38 Q54,26 44,22 Q32,18 14,20 Z" fill="#86EFAC" /><circle cx="20" cy="30" r="7" fill="#22D3EE" /><circle cx="22" cy="28" r="4" fill="#ECFEFF" /><circle cx="26" cy="22" r="4" fill="#22D3EE" /><path d="M28,16 L30,10 L34,14 L38,10 L42,16 L44,12 L48,18" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" fill="none" /><circle cx="38" cy="38" r="3" fill="#22D3EE" opacity="0.9" /></svg>
);

export const GoldenMinnowIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M20,20 Q8,32 12,44 Q20,56 36,52 Q52,48 56,40 Q52,32 44,28 Q36,24 20,20 Z" fill="#FBBF24" /><path d="M20,20 Q12,28 16,36 Q24,44 36,44 Q48,40 52,36 Q48,28 36,24 Z" fill="#FDE68A" opacity="0.7" /><circle cx="24" cy="30" r="5" fill="#1F2937" /><circle cx="25" cy="29" r="2.5" fill="#FFFFFF" /><path d="M52,32 Q60,28 62,32 Q60,36 52,36 Q48,40 44,36 Q48,32 52,32 Z" fill="#F59E0B" /><circle cx="38" cy="24" r="2" fill="#FFFFFF" opacity="0.9" /></svg>
);

export const GlowingAlgaeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect width="64" height="64" fill="#0F172A" /><path d="M14,20 Q10,28 18,32 Q24,36 20,44 Q16,48 12,42 Q10,36 14,32 Z" fill="#22D3EE" opacity="0.9" /><path d="M28,14 Q24,22 32,26 Q38,30 34,38 Q30,42 26,36 Q24,30 28,24 Z" fill="#86EFAC" opacity="0.85" /><path d="M46,22 Q42,30 50,34 Q56,38 52,46 Q48,50 44,44 Q42,38 46,32 Z" fill="#22D3EE" opacity="0.9" /><circle cx="32" cy="32" r="28" fill="#22D3EE" opacity="0.15" /></svg>
);

// CONSUMABLES
export const FoodIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect x="16" y="16" width="32" height="36" rx="4" fill="#94A3B8" /><ellipse cx="32" cy="16" rx="16" ry="4" fill="#E2E8F0" /><ellipse cx="32" cy="52" rx="16" ry="4" fill="#475569" /><rect x="20" y="24" width="24" height="20" rx="2" fill="#FDE68A" /><rect x="22" y="26" width="20" height="4" rx="1" fill="#F59E0B" /><circle cx="38" cy="14" r="3" fill="#FFFFFF" opacity="0.7" /></svg>
);

export const DrinkIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M20,16 L44,16 L46,20 Q48,24 48,32 Q48,48 44,56 L20,56 Q16,48 16,32 Q16,24 18,20 Z" fill="#E0F2FE" opacity="0.7" /><path d="M20,20 L44,20 L44,52 Q42,54 32,54 Q22,54 20,52 Z" fill="#0EA5E9" /><rect x="24" y="10" width="16" height="10" rx="2" fill="#1D4ED8" /><path d="M20,26 Q28,22 36,26 T44,26" stroke="#BFDBFE" strokeWidth="2" /></svg>
);

export const EnergyIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect x="14" y="16" width="36" height="32" rx="6" fill="#1E293B" /><rect x="46" y="22" width="8" height="6" rx="1" fill="#64748B" /><rect x="18" y="20" width="28" height="24" rx="3" fill="#22D3EE" /><rect x="22" y="24" width="4" height="16" fill="#ECFEFF" /><rect x="30" y="24" width="4" height="16" fill="#ECFEFF" /><rect x="38" y="24" width="4" height="16" fill="#ECFEFF" /></svg>
);

export const SilverIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><circle cx="32" cy="32" r="24" fill="#94A3B8" /><circle cx="32" cy="32" r="20" fill="#E2E8F0" /><circle cx="32" cy="32" r="25" stroke="#CBD5E1" strokeWidth="2" /><path d="M28,22 Q32,18 36,22 Q38,26 36,30 Q38,34 34,36 Q38,40 36,44 Q32,48 28,44 Q26,40 28,36 Q26,32 30,30 Q26,26 28,22 Z" fill="#475569" /><path d="M32,26 L32,38" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" /><circle cx="24" cy="20" r="3" fill="#FFFFFF" opacity="0.9" /></svg>
);

export const HeartIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M32,56 Q20,44 12,32 Q8,24 12,16 Q20,8 32,20 Q44,8 52,16 Q56,24 52,32 Q44,44 32,56 Z" fill="#EF4444" /><path d="M32,20 Q24,12 18,18 Q14,24 18,30 Q24,38 32,44" fill="#F87171" opacity="0.8" /><circle cx="26" cy="24" r="4" fill="#FFFFFF" opacity="0.6" /></svg>
);

// UI/NAVIGATION
export const ExploreIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><circle cx="32" cy="32" r="30" fill="#334155" /><circle cx="32" cy="32" r="24" fill="#FEF3C7" /><path d="M32,10 L32,20 M32,44 L32,54 M10,32 L20,32 M44,32 L54,32" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" /><path d="M32,10 L28,20 L32,16 L36,20 Z" fill="#EF4444" /><circle cx="32" cy="32" r="4" fill="#1E293B" /></svg>
);

export const QuestIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M16,20 Q12,24 12,32 Q12,40 16,44 L48,44 Q52,40 52,32 Q52,24 48,20 L16,20 Z" fill="#FEF3C7" /><path d="M16,20 L48,20 L44,16 L20,16 Z" fill="#FDE68A" /><rect x="28" y="18" width="8" height="20" rx="4" fill="#EF4444" /><circle cx="32" cy="42" r="5" fill="#EF4444" /></svg>
);

export const InventoryIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M18,16 Q14,20 14,32 Q14,48 18,56 L46,56 Q50,48 50,32 Q50,20 46,16 L18,16 Z" fill="#475569" /><path d="M18,16 L46,16 Q48,12 44,10 L20,10 Q16,12 18,16 Z" fill="#374151" /><rect x="20" y="10" width="6" height="20" rx="3" fill="#1E293B" /><rect x="38" y="10" width="6" height="20" rx="3" fill="#1E293B" /><rect x="28" y="20" width="8" height="4" rx="1" fill="#94A3B8" /></svg>
);

export const CraftIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M14,44 L50,44 L48,56 L16,56 Z" fill="#374151" /><path d="M18,40 L46,40 Q50,40 50,44 L14,44 Q14,40 18,40 Z" fill="#475569" /><rect x="28" y="8" width="8" height="28" rx="4" fill="#92400E" /><rect x="18" y="28" width="28" height="12" rx="4" fill="#64748B" /><circle cx="40" cy="38" r="4" fill="#F97316" opacity="0.8" /><circle cx="42" cy="36" r="2" fill="#FCA5A5" /></svg>
);

export const CharacterIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><circle cx="32" cy="18" r="10" fill="#374151" /><path d="M22,16 Q32,10 42,16 L42,20 Q32,26 22,20 Z" fill="#1E293B" /><rect x="18" y="28" width="28" height="24" rx="8" fill="#475569" /><rect x="12" y="30" width="8" height="20" rx="4" fill="#374151" /><rect x="44" y="30" width="8" height="20" rx="4" fill="#374151" /><circle cx="32" cy="16" r="12" fill="#22D3EE" opacity="0.25" /></svg>
);

export const BaseIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect x="12" y="20" width="40" height="36" rx="4" fill="#475569" /><path d="M8,20 L32,8 L56,20 Z" fill="#1E293B" /><rect x="24" y="36" width="16" height="20" rx="2" fill="#64748B" /><circle cx="36" cy="46" r="3" fill="#94A3B8" /><rect x="28" y="28" width="8" height="6" fill="#22D3EE" opacity="0.7" /><circle cx="32" cy="30" r="16" fill="#22D3EE" opacity="0.2" /></svg>
);

export const FurnaceIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect x="12" y="16" width="40" height="40" rx="6" fill="#1E293B" /><rect x="20" y="36" width="24" height="16" rx="4" fill="#F97316" /><rect x="22" y="38" width="20" height="12" rx="3" fill="#FCA5A5" /><rect x="26" y="8" width="12" height="12" rx="2" fill="#2D3748" /><path d="M28,32 Q30,26 32,32 Q34,26 36,32" fill="#F97316" opacity="0.9" /><circle cx="32" cy="44" r="20" fill="#F97316" opacity="0.2" /></svg>
);

export const MarketIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect x="28" y="8" width="8" height="48" rx="4" fill="#92400E" /><rect x="12" y="16" width="40" height="24" rx="4" fill="#475569" /><circle cx="32" cy="28" r="12" fill="#94A3B8" /><circle cx="32" cy="28" r="10" fill="#E2E8F0" /><path d="M32,28 L32,40" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" /><path d="M20,16 L20,12 M44,16 L44,12" stroke="#64748B" strokeWidth="3" /></svg>
);

export const FarmingIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect x="8" y="40" width="48" height="24" rx="4" fill="#92400E" /><rect x="28" y="8" width="8" height="36" rx="4" fill="#92400E" /><path d="M16,38 Q12,44 18,50 Q24,56 32,52 L32,44 L28,40 Q24,36 20,38 L16,38 Z" fill="#64748B" /><path d="M36,42 Q40,36 44,42 Q48,38 44,46 Q40,50 36,46 Q32,50 36,42 Z" fill="#22C55E" /><path d="M38,40 Q42,34 46,40" stroke="#16A34A" strokeWidth="3" /></svg>
);

export const FishingIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect width="64" height="64" fill="#0F172A" /><rect x="8" y="36" width="48" height="8" rx="2" fill="#92400E" /><rect x="16" y="44" width="4" height="20" fill="#92400E" /><path d="M20,32 Q28,20 36,28" stroke="#64748B" strokeWidth="5" /><path d="M36,28 L48,16" stroke="#475569" strokeWidth="4" /><circle cx="50" cy="40" r="12" stroke="#22D3EE" strokeWidth="3" fill="none" opacity="0.7" /><circle cx="50" cy="36" r="3" fill="#FCA5A5" /></svg>
);

export const FactoryIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect x="8" y="24" width="48" height="36" rx="4" fill="#1E293B" /><path d="M4,24 L32,8 L60,24 Z" fill="#374151" /><rect x="44" y="4" width="10" height="24" rx="3" fill="#475569" /><rect x="14" y="32" width="8" height="10" rx="1" fill="#22D3EE" opacity="0.8" /><rect x="26" y="32" width="8" height="10" rx="1" fill="#22D3EE" opacity="0.8" /><rect x="38" y="32" width="8" height="10" rx="1" fill="#22D3EE" opacity="0.8" /><rect x="18" y="46" width="28" height="10" rx="3" fill="#F97316" /></svg>
);

export const SkillsIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><circle cx="32" cy="32" r="22" fill="#1E293B" /><path d="M18,28 Q32,18 46,28 L46,36 Q32,48 18,36 Z" fill="#374151" /><path d="M24,24 Q28,20 32,24 Q36,20 40,24 Q38,28 36,30 Q32,34 28,30 Q26,28 24,24 Z" fill="#22D3EE" opacity="0.8" /><circle cx="24" cy="24" r="3" fill="#ECFEFF" /><circle cx="40" cy="24" r="3" fill="#ECFEFF" /><circle cx="32" cy="34" r="4" fill="#ECFEFF" /><path d="M24,24 Q32,20 40,24" stroke="#22D3EE" strokeWidth="2" /></svg>
);

export const TechIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><rect x="12" y="16" width="40" height="36" rx="6" fill="#1E293B" /><rect x="16" y="20" width="32" height="24" rx="3" fill="#22D3EE" opacity="0.25" /><path d="M20,26 L28,26 L28,30 L36,30 L36,34 L44,34" stroke="#67E8F9" strokeWidth="2" /><path d="M20,38 L32,38 L32,34 L40,34" stroke="#67E8F9" strokeWidth="2" /><circle cx="20" cy="26" r="2" fill="#ECFEFF" /><circle cx="28" cy="30" r="2" fill="#ECFEFF" /><circle cx="36" cy="34" r="2" fill="#ECFEFF" /><circle cx="44" cy="34" r="2" fill="#ECFEFF" /></svg>
);

export const WastelandAutomataIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><ellipse cx="32" cy="28" rx="22" ry="20" fill="#1E293B" /><rect x="30" y="6" width="4" height="12" rx="2" fill="#475569" /><circle cx="32" cy="6" r="3" fill="#64748B" /><circle cx="42" cy="22" r="8" fill="#22D3EE" /><circle cx="42" cy="22" r="5" fill="#67E8F9" /><circle cx="42" cy="22" r="2" fill="#ECFEFF" /><path d="M24,36 Q32,42 40,36 L40,44 Q36,48 32,48 Q28,48 24,44 Z" fill="#374151" /><path d="M20,24 Q28,20 36,24 Q40,28 38,32 Q36,36 28,34 Q24,32 20,28 Z" stroke="#22D3EE" strokeWidth="2.5" fill="none" opacity="0.8" /><ellipse cx="32" cy="28" rx="26" ry="24" fill="#22D3EE" opacity="0.2" /></svg>
);

export const ScrapIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}><path d="M10,36 L18,48 L28,44 L36,52 L46,46 L54,50 L58,38 Q54,30 48,32 L38,36 L26,34 Z" fill="#475569" /><path d="M14,28 Q22,20 34,24 L48,30 Q52,34 50,40 L38,44 Q30,42 24,38 Z" fill="#64748B" /><path d="M8,40 Q16,32 24,36 Q32,40 36,32 Q40,24 48,28" stroke="#374151" strokeWidth="6" fill="none" /><rect x="32" y="20" width="12" height="8" rx="2" fill="#334155" transform="rotate(30 38 24)" /></svg>
);
