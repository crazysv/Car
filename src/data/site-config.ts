export const siteConfig = {
  brand: "JP Rentals",
  tagline: "Premium Self-Drive Car Rental",
  description:
    "Premium self-drive car rental service in Kharar, Punjab & Haryana. Free delivery, online payment, and a curated fleet of well-maintained vehicles.",
  phone: "7027705618",
  phoneFormatted: "+91 70277 05618",
  phoneHref: "tel:+917027705618",
  whatsappHref: "https://wa.me/917027705618",
  email: "contact@jprentals.com",
  location: {
    name: "Modern Valley, Kharar",
    city: "Kharar",
    region: "Punjab & Haryana",
    fullAddress: "Modern Valley, Kharar, Punjab",
  },
  services: {
    delivery: true,
    deliveryFree: true,
    pickup: true,
    onlinePayment: true,
    offlinePayment: true,
  },
  booking: {
    advancePercent: 35,
    securityDeposit: 5000,
    cancellationHours: 12,
    requiredDocuments: ["Aadhaar Card", "Driving Licence"],
    fuelPolicy: "Fuel cost is paid by the customer",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Fleet", href: "/fleet" },
    { label: "Why Us", href: "/#why-us" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  footer: {
    quickLinks: [
      { label: "Home", href: "/" },
      { label: "Fleet", href: "/fleet" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Rental Policy", href: "/policy" },
    ],
    serviceLinks: [
      { label: "Self-Drive Rental", href: "/fleet" },
      { label: "Free Delivery", href: "/#why-us" },
      { label: "Online Booking", href: "/book" },
      { label: "Booking Terms", href: "/policy" },
    ],
  },
} as const;
