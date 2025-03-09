'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion'; 
import { Project, Task } from '@/types/dashboard';

// Simulating fetching real-time project analytics from an API
const fetchProjectAnalytics = async (): Promise<{
  projectProgress: { name: string; progress: number }[];
  metrics: { codeQuality: number; teamVelocity: number; bugResolution: number };
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        projectProgress: [
          { name: 'Week 1', progress: Math.floor(Math.random() * 30) + 10 },
          { name: 'Week 2', progress: Math.floor(Math.random() * 30) + 40 },
          { name: 'Week 3', progress: Math.floor(Math.random() * 30) + 60 },
          { name: 'Week 4', progress: Math.floor(Math.random() * 20) + 80 },
        ],
        metrics: {
          codeQuality: Math.floor(Math.random() * 20) + 80,
          teamVelocity: Math.floor(Math.random() * 20) + 70,
          bugResolution: Math.floor(Math.random() * 20) + 75,
        },
      });
    }, 1000);
  });
};

export default function ProjectAnalytics() {
  const [data, setData] = useState<{
    projectProgress: { name: string; progress: number }[];
    metrics: { codeQuality: number; teamVelocity: number; bugResolution: number };
  } | null>(null);

  useEffect(() => {
    fetchProjectAnalytics().then(setData);
  }, []);

  if (!data) {
    return <div className="text-center text-gray-500">Loading project analytics...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Project Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Project Progress Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.projectProgress}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="progress" stroke="#4F46E5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Project Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(data.metrics).map(([key, value]) => (
          <motion.div 
            key={key} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <motion.div 
                    className="text-2xl font-bold" 
                    whileHover={{ scale: 1.1 }}
                  >
                    {value}%
                  </motion.div>
                  <Progress value={value} className="h-2 bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
