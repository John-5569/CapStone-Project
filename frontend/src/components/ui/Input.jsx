import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Eye, EyeOff } from 'lucide-react';

export const Input = React.forwardRef(({ className, type, placeholder, value, onChange, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative w-full">
      <input
        type={actualType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          'flex h-12 w-full rounded-lg border border-[#e6e1da] bg-white px-4 py-3 text-base text-[#1e1915] transition-all',
          'placeholder:text-[#8c827a]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0061ff] focus-visible:border-[#0061ff]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'hover:border-[#c5bebe]',
          isPassword ? 'pr-12' : '',
          className
        )}
        ref={ref}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c827a] hover:text-[#1e1915] p-1 transition-colors focus:outline-none"
          tabIndex="-1"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
});

Input.displayName = 'Input';
