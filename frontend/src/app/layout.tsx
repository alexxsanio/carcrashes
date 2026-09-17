import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Colorado Road Observation",
  description: "Colorado highway and crash observation map",
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