import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, leftIcon, rightIcon, className = "", ...props }, ref) => {
    
    const getBorderClass = () => {
      if (error) return "border-red-500/50 focus-within:border-red-500";
      if (success) return "border-reward/50 focus-within:border-reward";
      return "border-card-border focus-within:border-pulse";
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[10px] uppercase tracking-widest text-foreground/50 font-bold ml-1">
            {label}
          </label>
        )}

        <div
          className={`
            relative flex items-center bg-card transition-all duration-200
            rounded-lg border overflow-hidden
            ${getBorderClass()}
            ${className}
          `}
        >
          {leftIcon && (
            <div className="pl-3 flex items-center justify-center text-foreground/40">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full bg-transparent px-3 py-2.5 text-sm text-foreground
              placeholder:text-foreground/20 outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            {...props}
          />

          {rightIcon && (
            <div className="pr-3 flex items-center justify-center text-foreground/40">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <span className="text-[11px] text-red-500 font-medium ml-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";