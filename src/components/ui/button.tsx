import React from 'react';
import { Loader2 } from 'lucide-react'; 

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'reward' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    isLoading, 
    leftIcon, 
    rightIcon, 
    children, 
    className = '', 
    disabled, 
    ...props 
  }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
   
    const variants = {
      primary: "bg-pulse text-white hover:brightness-110 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-white/10",
      outline: "bg-transparent border border-card-border text-foreground hover:bg-card-bg hover:border-pulse/50",
      reward: "bg-reward/10 border border-reward/20 text-reward hover:bg-reward/20",
      ghost: "bg-transparent text-foreground/70 hover:text-foreground hover:bg-card-bg"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-5 py-2.5 text-sm gap-2",
      lg: "px-8 py-3.5 text-base gap-3"
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="inline-flex">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";