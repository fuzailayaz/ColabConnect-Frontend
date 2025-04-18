import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon'
  children: React.ReactNode
  asChild?: boolean
}

// Utility function to return Tailwind class variants
export function buttonVariants({
  variant = 'primary',
  size = 'md',
}: {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 focus:outline-none'

  const sizeClasses: Record<string, string> = {
    xs: 'text-xs p-0 h-auto',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
  }

  const variantClasses: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'bg-transparent text-gray-800 hover:bg-gray-100',
    link: 'bg-transparent text-blue-600 hover:underline p-0 h-auto',
  }

  return `${baseClasses} ${sizeClasses[size || 'md']} ${variantClasses[variant || 'primary']}`
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const { theme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 focus:outline-none'

  const sizeClasses: Record<string, string> = {
    xs: 'text-xs p-0 h-auto',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
  }

  let variantStyle: React.CSSProperties = {}

  switch (variant) {
    case 'primary':
      variantStyle = {
        backgroundColor: theme.primary,
        color: '#FFFFFF',
        filter: isHovered ? 'brightness(1.1)' : 'none',
        transition: 'all 0.3s ease',
      }
      break
    case 'secondary':
      variantStyle = {
        backgroundColor: theme.secondary,
        color: theme.text,
        filter: isHovered ? 'brightness(1.05)' : 'none',
        transition: 'all 0.3s ease',
      }
      break
    case 'outline':
      variantStyle = {
        backgroundColor: 'transparent',
        color: theme.primary,
        border: `1px solid ${theme.primary}`,
        boxShadow: isHovered ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
        transition: 'all 0.3s ease',
      }
      break
    case 'ghost':
      variantStyle = {
        backgroundColor: 'transparent',
        color: theme.text,
        boxShadow: 'none',
        opacity: isHovered ? 0.8 : 1,
        transition: 'all 0.3s ease',
      }
      break
    case 'link':
      variantStyle = {
        backgroundColor: 'transparent',
        color: theme.primary,
        textDecoration: isHovered ? 'underline' : 'none',
        padding: '0',
        height: 'auto',
        transition: 'all 0.3s ease',
      }
      break
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      style={variantStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
