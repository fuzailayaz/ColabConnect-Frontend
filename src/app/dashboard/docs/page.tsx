'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DocsPage() {
  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Documentation</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">Technical documentation and API references will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}