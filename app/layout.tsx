import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { getDefaultDocuments } from "@/lib/defaultDocuments";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: "SIGA UFPR",
  description: "SIGA UFPR - Sistema Integrado de Gestão Acadêmica",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={sourceSans.variable}>
      <body>
        <AppShell defaultDocuments={getDefaultDocuments()}>{children}</AppShell>
      </body>
    </html>
  );
}
