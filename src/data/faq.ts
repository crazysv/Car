export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
}

export type FAQCategory =
  | "Booking"
  | "Payment"
  | "Documents"
  | "Delivery & Pickup"
  | "Cancellation"
  | "Security Deposit";

export const faqData: FAQItem[] = [
  {
    id: "faq-after-booking",
    question: "What happens after I book?",
    answer:
      "Once you pay the 35% advance, your vehicle is reserved. Our team will contact you to confirm the final pickup or free delivery details. The remaining balance is collected at the time of vehicle handover.",
    category: "Booking",
  },
  {
    id: "faq-full-amount-online",
    question: "Do I need to pay the full amount online?",
    answer:
      "No, you only need to pay a 35% advance online to confirm your booking. The remaining rental amount and the \u20B95,000 security deposit can be paid at the time of delivery or pickup via cash, UPI, or card.",
    category: "Payment",
  },
  {
    id: "faq-security-deposit",
    question: "When is the security deposit returned?",
    answer:
      "A refundable security deposit of \u20B95,000 is collected at handover. This deposit is fully refunded after you return the vehicle and it passes our standard post-rental inspection.",
    category: "Security Deposit",
  },
  {
    id: "faq-docs-required",
    question: "What documents are required?",
    answer:
      "You must present your original Aadhaar Card and a valid Driving Licence at the time of vehicle handover. Both documents will be verified by our team.",
    category: "Documents",
  },
  {
    id: "faq-fuel-policy",
    question: "Is fuel included?",
    answer:
      "No, fuel is paid by the customer. The vehicle will be handed over with a certain fuel level, and you should return it with the same level.",
    category: "Payment",
  },
  {
    id: "faq-payment-fails",
    question: "What if my online payment fails?",
    answer:
      "If your advance payment fails, your booking request will still be saved. You can retry the payment from your 'My Bookings' page or contact our support team for assistance.",
    category: "Payment",
  },
  {
    id: "faq-cancellation",
    question: "Can I cancel my booking?",
    answer:
      "Yes. Cancellation requests are reviewed by the JP Rentals team. Refund eligibility depends on timing, payment status, and the applicable cancellation policy (typically free within 12 hours of booking).",
    category: "Cancellation",
  },
  {
    id: "faq-delivery-free",
    question: "Is delivery free?",
    answer:
      "Yes, JP Rentals offers free delivery within our service area. We bring the car to your preferred location in Kharar and surrounding areas at no additional charge.",
    category: "Delivery & Pickup",
  },
  {
    id: "faq-contact",
    question: "How can I contact JP Rentals directly?",
    answer:
      "You can reach us directly at +91 70277 05618 via phone call or WhatsApp. Our team is available to help with bookings, queries, and support throughout your rental experience.",
    category: "Booking",
  },
];

export function getFAQsByCategory(category: FAQCategory): FAQItem[] {
  return faqData.filter((faq) => faq.category === category);
}

export const faqCategories: FAQCategory[] = [
  "Booking",
  "Payment",
  "Documents",
  "Delivery & Pickup",
  "Cancellation",
  "Security Deposit",
];

