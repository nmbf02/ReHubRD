import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";
import { SessionProvider } from "@/components/auth/SessionProvider";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "ReHub | Centro de Recuperación Post-Accidente",
  description:
    "Plataforma de acompañamiento continuo para personas en proceso de recuperación post-accidente en República Dominicana.",
  keywords: [
    "recuperación",
    "post-accidente",
    "rehabilitación",
    "República Dominicana",
    "acompañamiento",
    "reintegración",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("scroll-smooth", "font-sans", geist.variable)}>
      <body className={`${plusJakarta.variable} font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
