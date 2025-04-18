// src/components/dashboard/StatisticsCards.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Users, CheckCircle, Award } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  description: string;
  loading?: boolean;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  description, 
  loading = false
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            <div className={`p-2 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20`}>
              <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
          </div>
          
          {loading ? (
            <div className="mt-4 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
          ) : (
            <div className="mt-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {value}
              </span>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface StatisticsCardsProps {
  stats: StatCardProps[];
  loading?: boolean;
}

export default function StatisticsCards({ stats, loading = false }: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard 
          key={index}
          title={stat.title}
          value={loading ? '-' : stat.value}
          icon={stat.icon}
          color={stat.color}
          description={stat.description}
          loading={loading}
        />
      ))}
    </div>
  );
}