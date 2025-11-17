// src/hooks/use-breakpoint.ts
import { useState, useEffect } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);

type Breakpoint = keyof typeof fullConfig.theme.screens;

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [isBreakpoint, setIsBreakpoint] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const screen = fullConfig.theme.screens[breakpoint];
      const mql = window.matchMedia(`(max-width: ${screen})`);

      const onChange = (e: MediaQueryListEvent) => {
        setIsBreakpoint(e.matches);
      };
      
      setIsBreakpoint(mql.matches);

      mql.addEventListener('change', onChange);

      return () => {
        mql.removeEventListener('change', onChange);
      };
    }
  }, [breakpoint]);

  return isBreakpoint;
}
