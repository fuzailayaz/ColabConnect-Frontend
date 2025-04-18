import { ReactNode } from 'react';
import { useTheme } from '../../contexts/ThemeContext'; // Import from your project
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'; // Import from Framer

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  value?: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: string[];
  onClick?: () => void;
  children?: ReactNode;
}

const DashboardCard = ({
  title,
  subtitle,
  icon,
  value,
  trend,
  gradient = ['#4F46E5', '#7C3AED'],
  onClick,
  children,
}: DashboardCardProps) => {

  const { theme } = useTheme();
  const isDarkMode = theme.mode === 'dark';
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className={`
        relative overflow-hidden rounded-2xl
        ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
        p-6 shadow-lg transition-shadow duration-300
        hover:shadow-xl cursor-pointer
        border border-transparent
        ${isDarkMode ? 'hover:border-gray-700' : 'hover:border-gray-100'}
      `}
    >
      {/* Gradient Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              ${gradient[0]}10,
              transparent 80%
            )
          `,
        }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`
                p-2 rounded-lg
                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}
              `}>
                {icon}
              </div>
            )}
            <div>
              <h3 className={`
                font-semibold text-lg
                ${isDarkMode ? 'text-white' : 'text-gray-900'}
              `}>
                {title}
              </h3>
              {subtitle && (
                <p className={`
                  text-sm mt-1
                  ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                `}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {value && (
            <div className="mt-4">
              <span className={`
                text-3xl font-bold
                ${isDarkMode ? 'text-white' : 'text-gray-900'}
              `}>
                {value}
              </span>
              {trend && (
                <span className={`
                  ml-2 text-sm font-medium
                  ${trend.isPositive ? 'text-green-500' : 'text-red-500'}
                `}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
          )}

          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>

      {/* Interactive Hover Effect */}
      <div className={`
        absolute inset-0 transition-colors duration-300
        ${isDarkMode ? 'group-hover:bg-gray-700/10' : 'group-hover:bg-gray-50/50'}
      `} />
    </motion.div>
  );
};export default DashboardCard;