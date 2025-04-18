// src/app/dashboard/trends/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useTrendsInsights from '@/hooks/useTrendsInsights';

export default function TrendsPage() {
  const { insights, loading, error } = useTrendsInsights();

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Trends & Insights</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skill Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading trends...</div>
          ) : error ? (
            <div>Error loading trends: {error}</div>
          ) : (
            <div>
              {/* Render trends data */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}