'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Brain, Users, Code, Star } from 'lucide-react';

const recommendations = [
  {
    type: 'project',
    title: 'ML-Based Image Recognition',
    match: 95,
    skills: ['Python', 'TensorFlow', 'Computer Vision'],
    icon: Code,
  },
  {
    type: 'team',
    title: 'Team Alpha',
    match: 92,
    skills: ['React', 'Node.js', 'AWS'],
    icon: Users,
  },
  {
    type: 'skill',
    title: 'Recommended Learning: Docker',
    match: 88,
    reason: 'Highly demanded in your matched projects',
    icon: Brain,
  },
];

export default function AIRecommendations() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm">{item.match}% Match</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {item.skills && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {item.reason && (
                  <p className="text-sm text-muted-foreground">{item.reason}</p>
                )}
                <Button className="w-full mt-4">Learn More</Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
