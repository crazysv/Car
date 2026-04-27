"use client";

import { useState } from "react";

interface AccordionItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export function AccordionItem({
  question,
  answer,
  defaultOpen = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden mb-4 last:mb-0 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left group cursor-pointer bg-white hover:bg-surface-container-lowest transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-headline-md text-[18px] text-primary pr-4">
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline group-hover:bg-secondary-container group-hover:text-on-secondary-container transition-all duration-300 ${isOpen ? "rotate-180 bg-primary text-white group-hover:bg-primary group-hover:text-white" : ""}`}
        >
          <span className="material-symbols-outlined text-[20px]">
            expand_more
          </span>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 bg-white ${isOpen ? "max-h-96" : "max-h-0"}`}
      >
        <div className="p-6 pt-0 border-t border-outline-variant/30 mt-2 mx-6">
          <p className="text-sm md:text-base text-outline leading-relaxed mt-4">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

interface AccordionGroupProps {
  items: { question: string; answer: string }[];
}

export function AccordionGroup({ items }: AccordionGroupProps) {
  return (
    <div className="w-full">
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          question={item.question}
          answer={item.answer}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  );
}
