// src/app/auth-layout.tsx
'use client';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingScreen from '@/components/game/LoadingScreen';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return <LoadingScreen />;
  }

  return (
      <main className="relative min-h-screen w-full flex items-center justify-center p-4">
        <div 
            className="absolute inset-0 bg-background -z-10"
            style={{
            backgroundImage: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%), radial-gradient(circle at bottom left, hsl(var(--accent) / 0.1), transparent 50%)'
            }}
        />
        {children}
      </main>
  );
}
