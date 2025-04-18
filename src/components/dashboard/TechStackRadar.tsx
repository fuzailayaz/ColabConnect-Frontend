'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface TechStackRadarProps {
  skills: { [key: string]: number };
}

const TechStackRadar = ({ skills }: TechStackRadarProps) => {
  const { theme } = useTheme();

  const data = {
    labels: Object.keys(skills),
    datasets: [
      {
        label: 'Skill Level',
        data: Object.values(skills),
        backgroundColor: `${theme.primary}40`,
        borderColor: theme.primary,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          color: theme.text,
        },
        grid: {
          color: `${theme.text}20`,
        },
        pointLabels: {
          color: theme.text,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: theme.text,
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Radar data={data} options={options} />
    </div>
  );
};

export default TechStackRadar;
