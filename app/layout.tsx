import type { Metadata } from "next";
import "./globals.css";
import { ConsentBanner } from "@/components/consent-banner";

export const metadata: Metadata = {
  title: "SALHI AUTO | سيارات مختارة في ورقلة",
  description: "اكتشف سيارات Salhi Auto المتاحة في ورقلة، الجزائر.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}<ConsentBanner /></body></html>;
}
