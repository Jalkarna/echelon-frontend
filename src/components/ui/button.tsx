import * as React from "react";

import { cn } from "../../lib/utils"; // Ensure this path is correct

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost";

  size?: "default" | "sm" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-blue-600 hover:bg-blue-700",
      secondary: "bg-green-600 hover:bg-green-700",
      ghost: "bg-transparent hover:bg-gray-700",
    };

    const sizeClasses = {
      default: "px-4 py-2",
      sm: "px-2 py-1 text-sm",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",

          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",

          "disabled:opacity-50 disabled:pointer-events-none",

          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
