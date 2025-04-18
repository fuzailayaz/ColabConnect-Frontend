import React, { forwardRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Add any additional props here
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const { theme } = useTheme();
    
    return (
      <input
        type={type || 'text'}
        className={cn(
          "flex h-10 w-full rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        style={{
          backgroundColor: theme.background,
          color: theme.text,
          borderColor: theme.border,
          borderWidth: '1px',
          borderStyle: 'solid',
          ...props.style
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
