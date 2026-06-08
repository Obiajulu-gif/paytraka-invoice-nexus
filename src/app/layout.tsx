import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Paytraka Invoice Nexus",
    template: "%s | Paytraka Invoice Nexus",
  },
  description:
    "Smart invoicing, receipts, customer management, and billing reports for Nigerian SMEs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
