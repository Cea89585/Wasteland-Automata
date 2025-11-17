// src/components/game/TechPanel.tsx
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function TechPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technology Tree</CardTitle>
        <CardDescription>Unlock the secrets of the old world to build a new one.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center h-48">
        <BookOpen className="h-16 w-16 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Technology progression coming soon.</p>
      </CardContent>
    </Card>
  );
}
