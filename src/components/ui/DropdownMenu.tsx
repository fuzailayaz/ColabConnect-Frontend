// src/components/ui/DropdownMenu.tsx
'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = DropdownMenuPrimitive.Content;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={`text-sm rounded px-2 py-1.5 cursor-pointer outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${className}`}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.Item>
));

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
};