import { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";
import UXProviders from "@/components/providers/UXProviders";
import RSCNavigationWrapper from "@/components/RSCNavigationWrapper";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Portfolio",
  description: "Professional portfolio",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} antialiased bg-neutral-950 text-neutral-100`}
      >
        <RSCNavigationWrapper>
          <UXProviders>
            {children}
          </UXProviders>
        </RSCNavigationWrapper>
      </body>
    </html>
  );
}
