import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group bg-white rounded-xl p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 border border-stone/20">
      <div className="w-12 h-12 rounded-lg bg-sand flex items-center justify-center mb-4 text-bronze group-hover:bg-bronze/10 transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-heading text-base md:text-lg text-navy mb-2">
        {title}
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}
