import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayTraka | E-Invoicing Readiness for Nigerian Businesses",
  description:
    "Create, validate, send, and submit compliant e-invoices through PayTraka's Nigerian tax readiness workflow platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
