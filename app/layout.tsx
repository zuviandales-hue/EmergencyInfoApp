import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeQR",
  description: "Emergency QR profiles for vulnerable people and medical situations."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
