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
    id: "faq-docs-required",
    question: "What documents are required for booking?",
    answer:
      "You need a valid Aadhaar Card and a Driving Licence to rent a car from JP Rentals. Both documents must be original and will be verified at the time of pickup or delivery.",
    category: "Documents",
  },
  {
    id: "faq-online-payment",
    question: "Is online payment available?",
    answer:
      "Yes, online payment is available from the start. You can pay your booking advance securely online using UPI, net banking, or card payment. We also accept offline payments at the time of pickup.",
    category: "Payment",
  },
  {
    id: "faq-offline-payment",
    question: "Can I also pay offline?",
    answer:
      "Yes, JP Rentals accepts both online and offline payments. You can choose to pay the advance online and the remaining amount in cash or card at the time of vehicle handover.",
    category: "Payment",
  },
  {
    id: "faq-advance-amount",
    question: "How much advance payment is required?",
    answer:
      "A 35% advance payment of the total rental amount is required to confirm your booking. The remaining balance can be paid at the time of delivery or pickup.",
    category: "Booking",
  },
  {
    id: "faq-security-deposit",
    question: "Is there any security deposit?",
    answer:
      "Yes, a refundable security deposit of \u20B95,000 is required at the start of the rental. This deposit is fully refunded after the vehicle is returned in good condition.",
    category: "Security Deposit",
  },
  {
    id: "faq-delivery-free",
    question: "Is delivery free?",
    answer:
      "Yes, JP Rentals offers free delivery within our service area. We bring the car to your preferred location in Kharar and surrounding areas at no additional charge.",
    category: "Delivery & Pickup",
  },
  {
    id: "faq-pickup-available",
    question: "Is pickup available?",
    answer:
      "Yes, vehicle pickup is available. You can either visit our location at Modern Valley, Kharar, or we can arrange pickup from your location within our service area.",
    category: "Delivery & Pickup",
  },
  {
    id: "faq-service-area",
    question: "Which areas do you serve?",
    answer:
      "JP Rentals is based in Modern Valley, Kharar, and provides self-drive car rental services across Punjab and Haryana. Free delivery is available within our primary service area.",
    category: "Delivery & Pickup",
  },
  {
    id: "faq-cancellation",
    question: "What is the cancellation policy?",
    answer:
      "Cancellation should be done within 12 hours of booking to receive a full refund of the advance payment. Cancellations after this window may be subject to partial deduction.",
    category: "Cancellation",
  },
  {
    id: "faq-fuel-policy",
    question: "Who pays for fuel?",
    answer:
      "The fuel cost is paid by the customer. The vehicle is handed over with a certain fuel level, and you are expected to return it with the same level. Any fuel used during the rental period is your responsibility.",
    category: "Payment",
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
