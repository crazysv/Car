export interface PolicySection {
  id: string;
  title: string;
  icon: string;
  items: string[];
}

export const policyData: PolicySection[] = [
  {
    id: "booking",
    title: "Booking & Advance",
    icon: "receipt_long",
    items: [
      "A 35% advance payment of the total rental amount is required to confirm your booking.",
      "The remaining 65% can be paid at the time of vehicle delivery or pickup.",
      "Booking is confirmed only after advance payment is received.",
    ],
  },
  {
    id: "deposit",
    title: "Security Deposit",
    icon: "security",
    items: [
      "A refundable security deposit of \u20B95,000 is required at the start of every rental.",
      "The deposit is fully refunded after the vehicle is returned in good condition.",
      "Any damages or violations during the rental period may be deducted from the deposit.",
    ],
  },
  {
    id: "documents",
    title: "Documents Required",
    icon: "badge",
    items: [
      "A valid Aadhaar Card is mandatory for identity verification.",
      "A valid Driving Licence is mandatory for all drivers.",
      "Both documents must be original and presented at the time of vehicle handover.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery & Pickup",
    icon: "local_shipping",
    items: [
      "Free delivery is available within our primary service area in Kharar and nearby locations.",
      "Vehicle pickup from our location at Modern Valley, Kharar is also available.",
      "Delivery and pickup timing will be coordinated at the time of booking confirmation.",
    ],
  },
  {
    id: "fuel",
    title: "Fuel Policy",
    icon: "local_gas_station",
    items: [
      "Fuel cost during the rental period is paid by the customer.",
      "The vehicle is handed over with a certain fuel level.",
      "The vehicle must be returned with the same fuel level it was delivered with.",
    ],
  },
  {
    id: "cancellation",
    title: "Cancellation",
    icon: "assignment_return",
    items: [
      "Cancellation should be done within 12 hours of booking confirmation.",
      "Full refund of advance payment is applicable for cancellations within the 12-hour window.",
      "Late cancellations may be subject to partial deduction from the advance amount.",
    ],
  },
  {
    id: "payment",
    title: "Payment Modes",
    icon: "credit_card",
    items: [
      "Online payment is available from the start via UPI, net banking, and card payments.",
      "Offline payment (cash/card) is accepted at the time of vehicle handover.",
      "Both online and offline payment options are available for your convenience.",
    ],
  },
];
