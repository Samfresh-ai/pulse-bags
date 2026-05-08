"use client";
import React from "react";

interface ProgressProps {
  value: number; 
  max?: number;
  variant?: "pulse" | "reward";
  size?: "xs" | "sm" | "md";
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const Progress = ({
  value = 0,
  max = 100,
  variant = "pulse",
  size = "sm",
  label,
  showValue = false,
  className = "",
}: ProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heights = {
    xs: "h-1",
    sm: "h-2",
    md: "h-4",
  };

  const variants = {
    pulse: "bg-pulse shadow-[0_0_12px_rgba(139,92,246,0.4)]",
    reward: "bg-reward shadow-[0_0_12px_rgba(34,197,94,0.4)]",
  };

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-end px-0.5">
          {label && (
            <span className="text-[10px] uppercase tracking-widest text-foreground/50 font-bold">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-[10px] font-mono text-foreground/70">
              {value}/{max}
            </span>
          )}
        </div>
      )}

      <div className={`w-full bg-card-border overflow-hidden rounded-full ${heights[size]}`}>
        <div
          className={`transition-all duration-700 ease-out rounded-full ${variants[variant]} ${heights[size]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};