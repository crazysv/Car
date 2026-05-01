import React from "react";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
}

const steps: Step[] = [
  {
    number: "1",
    title: "Select Vehicle",
    description: "Browse our curated fleet to find the perfect car for your journey.",
    icon: "search",
  },
  {
    number: "2",
    title: "Book & Pay Advance",
    description: "Confirm your dates and secure the booking with a 35% advance.",
    icon: "credit_card",
  },
  {
    number: "3",
    title: "Verify Documents",
    description: "Provide your Aadhaar and Driving Licence before handover.",
    icon: "badge",
  },
  {
    number: "4",
    title: "Free Delivery",
    description: "We deliver the car to your doorstep across our service network.",
    icon: "local_shipping",
  },
];

export function ProcessSteps() {
  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-8 md:p-12 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 relative">
        {/* Horizontal connector line for desktop */}
        <div className="hidden md:block absolute top-8 left-[12.5%] w-[75%] h-[2px] bg-outline-variant" />

        {steps.map((step) => (
          <div key={step.number} className="relative z-10 flex flex-col items-center text-center group">
            {/* Step Icon Container */}
            <div className="w-16 h-16 bg-white border-2 border-outline-variant rounded-full flex items-center justify-center text-primary mb-6 shadow-sm group-hover:border-primary group-hover:text-primary-container transition-colors duration-300">
              <span className="material-symbols-outlined text-[28px]">{step.icon}</span>
            </div>

            {/* Step Number Tag */}
            <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">
              Step {step.number}
            </span>

            {/* Title & Description */}
            <h3 className="text-primary font-bold text-lg mb-2">
              {step.title}
            </h3>
            <p className="text-outline text-sm leading-relaxed max-w-[200px]">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
