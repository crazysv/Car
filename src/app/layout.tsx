import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
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
  ],
  openGraph: {
    title: "JP Rentals - Premium Self-Drive Car Rental",
    description:
      "Premium self-drive car rental in Kharar, Punjab & Haryana. Free delivery, online payment, curated fleet.",
    siteName: "JP Rentals",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface font-body-md">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
