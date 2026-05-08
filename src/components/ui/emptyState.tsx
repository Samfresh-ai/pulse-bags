import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  isCompact?: boolean;
}

export const EmptyState = ({
  title,
  description,
  icon = <FolderOpen size={40} />,
  actionText,
  onAction,
  isCompact = false,
}: EmptyStateProps) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center 
        rounded-xl border border-dashed border-card-border
        bg-card-bg/30 px-6
        ${isCompact ? "py-8" : "py-16"}
      `}
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-pulse/20 blur-2xl rounded-full" />
        <div className="relative text-foreground/20">{icon}</div>
      </div>

      <h3 className={`font-semibold text-foreground ${isCompact ? "text-sm" : "text-lg"}`}>
        {title}
      </h3>
      
      {description && (
        <p className={`text-foreground/40 mt-1 max-w-[280px] ${isCompact ? "text-xs" : "text-sm"}`}>
          {description}
        </p>
      )}

      {actionText && onAction && (
        <Button
          variant="outline"
          size={isCompact ? "sm" : "md"}
          className="mt-6"
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};