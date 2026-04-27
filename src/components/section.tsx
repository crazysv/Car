import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  variant?: "default" | "sand" | "dark" | "stone";
}

const variantStyles: Record<NonNullable<SectionProps["variant"]>, string> = {
  default: "bg-surface text-on-surface",
  sand: "bg-surface-container-low text-on-surface",
  dark: "bg-primary-container text-white",
  stone: "bg-surface-container-highest text-on-surface",
};

export function Section({
  children,
  className = "",
  id,
  variant = "default",
}: SectionProps) {
  return (
    <section id={id} className={`${variantStyles[variant]} ${className}`}>
      <div className="max-w-container-max mx-auto section-padding py-16 md:py-24">
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  centered?: boolean;
  dark?: boolean;
}

export function SectionHeader({
  label,
  title,
  description,
  centered = true,
  dark = false,
}: SectionHeaderProps) {
  return (
    <div
      className={`mb-10 md:mb-14 ${centered ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}`}
    >
      {label && (
        <span
          className={`font-label-bold uppercase tracking-widest ${dark ? "text-secondary-fixed" : "text-secondary"} mb-3 block`}
        >
          {label}
        </span>
      )}
      <h2
        className={`font-headline-lg ${dark ? "text-white" : "text-primary"} mb-4`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`font-body-lg leading-relaxed ${dark ? "text-white/70" : "text-outline"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
