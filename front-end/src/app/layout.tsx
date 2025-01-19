import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Black_Ops_One } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const blackOpsOne = Black_Ops_One({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-black-ops-one',
});

export const metadata: Metadata = {
  title: "MapShield - Mapping Protection, One Asset at a Time",
  description: "MapShield is your go-to solution for protecting valuable assets, like solar panels, from unpredictable events like hailstorms and extreme weather. By combining real-time mapping technology with advanced safety protocols, MapGuard helps you monitor, safeguard, and secure your investments. Whether you're at home or on the go, our app provides you with a reliable shield against the unexpected, giving you peace of mind knowing that your assets are always protected.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${blackOpsOne.variable}`}>{children}</body>
    </html>
  );
}
