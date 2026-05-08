"use client";
import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | string; 
}

export default function Spinner({ size = "md" }: SpinnerProps) {
  const sizeClasses: Record<string, string> = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const selectedSize = sizeClasses[size] || size;

  return (
    <div
      className={`${selectedSize} border-pulse rounded-full border-t-transparent animate-spin`}
      style={{ borderTopColor: "transparent" }} 
      aria-label="loading"
    />
  );
}