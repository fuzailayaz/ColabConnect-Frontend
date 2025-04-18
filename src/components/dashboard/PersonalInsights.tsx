'use client';

import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Award, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Metric {
  name: string;
  value: number;
  change: number;
  target?: number;
}

const PersonalInsights = () => {
  const [metrics, setMetrics] = useState<Metric[]>([
    { name: 'Collaboration Score', value: 78, change: 12, target: 85 },
    { name: 'Projects Contributed', value: 5, change: 2 },
    { name: 'Tasks Completed', value: 23, change: 8 },
    { name: 'Team Interactions', value: 47, change: 15 }
  ]);
  
  const [achievements, setAchievements] = useState<{name: string, date: string}[]>([
    { name: 'First Project Completed', date: '2 weeks ago' },
    { name: 'Collaboration Milestone: 5 Projects', date: '3 days ago' },
    { name: 'Top Contributor - Web Dev Team', date: 'Yesterday' }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart2 className="mr-2 h-5 w-5 text-blue-500" />
          Personal Insights
        </CardTitle>
        <CardDescription>
          AI-generated analytics about your collaboration journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Your Metrics</h3>
            <div className="space-y-4">
              {metrics.map(metric => (
                <div key={metric.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{metric.name}</span>
                    <span className="text-sm font-medium">
                      {metric.value}
                      <span className={`ml-2 text-xs ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </span>
                  </div>
                  {metric.target && (
                    <>
                      <Progress value={metric.value} max={metric.target} className="h-2 bg-gray-200" />
                      <div className="text-xs text-gray-500 text-right">
                        Target: {metric.target}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <TrendingUp className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">AI Insight</h4>
                  <p className="text-sm text-gray-600">
                    Your collaboration score has increased by 12% this month. Keep engaging with team discussions to reach your target!
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Recent Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start">
                  <div className="mt-0.5 mr-3">
                    <Award className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{achievement.name}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {achievement.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-start">
                <Award className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Next Achievement</h4>
                  <p className="text-sm text-gray-600">
                    You're 2 tasks away from earning the "Productivity Master" badge. Keep up the momentum!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInsights;
