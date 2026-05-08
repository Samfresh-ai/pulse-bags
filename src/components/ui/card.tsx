import React from "react";

type RoundedSize = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
  isHoverable?: boolean;
  rounded?: RoundedSize;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      description,
      footer,
      headerAction,
      isHoverable,
      rounded = "xl", 
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    
    const roundedClasses: Record<RoundedSize, string> = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      full: "rounded-3xl",
    };

    return (
      <div
        ref={ref}
        className={`
          glass-card flex flex-col overflow-hidden
          ${roundedClasses[rounded]}
          ${isHoverable ? "hover:border-pulse/40 hover:shadow-[0_0_25px_rgba(139,92,246,0.05)] transition-all duration-300" : ""}
          ${className}
        `}
        {...props}
      >
        {(title || description || headerAction) && (
          <div className="p-5 border-b border-card-border flex justify-between items-start">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-foreground tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-foreground/50 mt-1">
                  {description}
                </p>
              )}
            </div>
            {headerAction && <div className="ml-4">{headerAction}</div>}
          </div>
        )}

        <div className="p-5 flex-1">
          {children}
        </div>

        {footer && (
          <div className="px-5 py-4 bg-white/[0.02] border-t border-card-border">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";