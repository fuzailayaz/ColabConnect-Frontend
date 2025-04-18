// src/app/dashboard/collaborators/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RecommendedCollaborators from '@/components/dashboard/RecommendedCollaborators';

export default function CollaboratorsPage() {
  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Collaborators</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Collaborators</CardTitle>
        </CardHeader>
        <CardContent>
          <RecommendedCollaborators />
        </CardContent>
      </Card>
    </div>
  );
}