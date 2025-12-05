
'use client';

import { useGame } from '@/hooks/use-game';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/next';

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { gameState } = useGame();

  useEffect(() => {
    if (typeof window !== 'undefined' && gameState.isInitialized) {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (gameState.theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
        } else {
        root.classList.add(gameState.theme);
        }
    }
  }, [gameState.theme, gameState.isInitialized]);

  return <>{children}</>;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeWrapper>
            {children}
        </ThemeWrapper>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
