
import type { Metadata } from 'next';
import './globals.css';
import { GameProvider } from '@/contexts/game-context';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'Wasteland Automata',
  description: 'A post-apocalyptic text-based survival game.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GameProvider>
      <ClientLayout>{children}</ClientLayout>
    </GameProvider>
  );
}
