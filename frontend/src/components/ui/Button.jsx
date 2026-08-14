import React from 'react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', children, disabled, ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0061ff] disabled:pointer-events-none disabled:opacity-60 cursor-pointer';
  
  const variants = {
    primary: 'bg-[#0061ff] hover:bg-[#0052d6] text-white rounded-lg shadow-sm border border-[#0052d6]',
    secondary: 'bg-[#f1ede8] text-[#1e1915] hover:bg-[#e6e1da] rounded-lg border border-[#e6e1da]',
    outline: 'border border-[#e6e1da] bg-white hover:bg-[#f7f5f2] text-[#1e1915] rounded-lg',
    ghost: 'hover:bg-[#f1ede8] text-[#1e1915] rounded-lg',
  };

  const sizes = {
    default: 'h-11 px-5 py-2 text-sm',
    sm: 'h-9 px-4 text-xs rounded-md',
    lg: 'h-12 px-8 text-base rounded-lg',
    icon: 'h-10 w-10',
  };

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
