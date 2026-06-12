import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://paytraka.com"),
  title: {
    default: "PayTraka | Nigerian E-Invoicing, Payments & Tax Compliance",
    template: "%s | PayTraka",
  },
  description:
    "Run invoices, payments, customers, reports, and Nigerian tax compliance workflows from one secure PayTraka workspace.",
  keywords: [
    "PayTraka",
    "Nigerian invoicing software",
    "e-invoicing Nigeria",
    "FIRS readiness",
    "NRS compliance",
    "SME invoicing",
    "VAT reporting",
  ],
  applicationName: "PayTraka",
  authors: [{ name: "PayTraka" }],
  creator: "PayTraka",
  publisher: "PayTraka",
  icons: {
    icon: [
      { url: "/paytraka_logo/favicon.ico" },
      { url: "/paytraka_logo/favicon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/paytraka_logo/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/paytraka_logo/favicon.ico",
    apple: "/paytraka_logo/favicon-256.png",
  },
  openGraph: {
    title: "PayTraka | Nigerian E-Invoicing, Payments & Tax Compliance",
    description:
      "Create invoices, receive payments, manage customers, and prepare tax-compliance records for Nigerian SMEs.",
    url: "https://paytraka.com",
    siteName: "PayTraka",
    images: [
      {
        url: "/paytraka_logo/paytraka-logo-white-bg.png",
        width: 1200,
        height: 630,
        alt: "PayTraka",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PayTraka | Nigerian E-Invoicing, Payments & Tax Compliance",
    description:
      "One workspace for invoicing, payments, reporting, and Nigerian compliance readiness.",
    images: ["/paytraka_logo/paytraka-logo-white-bg.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0001B1",
  colorScheme: "light",
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
