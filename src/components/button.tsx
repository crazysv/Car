import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  fullWidth?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 transition-all duration-200 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-label-bold";

const variantStyles = {
  primary:
    "bg-primary-container text-on-primary hover:opacity-90 shadow-md active:scale-95",
  secondary:
    "bg-secondary-container text-on-secondary-container hover:opacity-90 shadow-md active:scale-95",
  outline:
    "border border-outline-variant text-on-surface hover:bg-surface-container active:scale-95",
  ghost: "text-primary hover:bg-primary/5 active:scale-95",
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-4 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
