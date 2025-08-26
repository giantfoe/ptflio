import { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import UXProviders from "@/components/providers/UXProviders";
import RSCNavigationWrapper from "@/components/RSCNavigationWrapper";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "Portfolio",
  description: "Professional portfolio",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} ${geistMono.className} bg-neutral-950 text-neutral-100`}>
        <RSCNavigationWrapper>
          <UXProviders>
            {children}
          </UXProviders>
        </RSCNavigationWrapper>
      </body>
    </html>
  );
}
