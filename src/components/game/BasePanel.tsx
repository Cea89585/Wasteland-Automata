// src/components/game/BasePanel.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';

export default function BasePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Base</CardTitle>
        <CardDescription>A small patch of wasteland to call your own.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center h-48">
        <Home className="h-16 w-16 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Base building and automation coming soon.</p>
      </CardContent>
    </Card>
  );
}
