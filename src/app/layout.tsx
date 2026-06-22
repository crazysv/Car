import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { MobileBookingBar } from "@/components/mobile-booking-bar";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://car-ruby-mu.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JP Rentals - Premium Self-Drive Car Rental in Kharar",
    template: "%s | JP Rentals",
  },
  description:
    "Premium self-drive car rental in Kharar, Punjab & Haryana. Free delivery, online payment, curated fleet. Book your ride today.",
  keywords: [
    "car rental",
    "self-drive",
    "Kharar",
    "Punjab",
    "Haryana",
    "JP Rentals",
    "premium car rental",
    "car rental Kharar",
    "self drive Punjab",
    "car rental Chandigarh",
    "car rental Mohali",
    "car rental Panchkula",
    "rental car Tricity",
    "self drive Haryana",
  ],
  openGraph: {
    title: "JP Rentals - Premium Self-Drive Car Rental",
    description:
      "Premium self-drive car rental in Kharar, Punjab & Haryana. Free delivery, online payment, curated fleet.",
    siteName: "JP Rentals",
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "JP Rentals - Premium Self-Drive Car Rental in Kharar, Punjab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JP Rentals - Premium Self-Drive Car Rental",
    description:
      "Premium self-drive car rental in Kharar, Punjab & Haryana. Free delivery, online payment, curated fleet.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoRental",
              "name": "JP Rentals",
              "url": siteUrl,
              "telephone": "+917027705618",
              "areaServed": ["Kharar", "Punjab", "Haryana"],
              "image": `${siteUrl}/og-image.jpg`
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface font-body-md">
        <Navbar />
        <main className="flex-1 pb-[68px] lg:pb-0">{children}</main>
        <div className="pb-[68px] lg:pb-0">
          <Footer />
        </div>
        <MobileBookingBar />
        <WhatsappFab />
      </body>
    </html>
  );
}
