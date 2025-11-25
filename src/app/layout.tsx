
import type { Metadata } from 'next';
import './globals.css';
import { GameProvider } from '@/contexts/game-context';
import ClientLayout from './client-layout';
import { FirebaseProvider } from '@/firebase/provider';

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
    <FirebaseProvider>
      <GameProvider>
        <ClientLayout>{children}</ClientLayout>
      </GameProvider>
    </FirebaseProvider>
  );
}
