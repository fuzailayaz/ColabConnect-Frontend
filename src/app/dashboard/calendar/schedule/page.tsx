'use client';
import { useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SchedulePage() {
const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Team Schedule</h2>
      </div>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
}