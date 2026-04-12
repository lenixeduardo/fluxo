import type { Metadata, Viewport } from "next";
import { AuthProvider }   from "@/contexts/AuthContext";
import { ToastProvider }  from "@/contexts/ToastContext";
import "./globals.css";

export const metadata: Metadata = {
  title:       "Fluxo — Finanças Pessoais",
  description: "Seu dinheiro, em movimento.",
  manifest:    "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Fluxo" },
};

export const viewport: Viewport = {
  themeColor:    "#0a0f1e",
  width:         "device-width",
  initialScale:  1,
  maximumScale:  1,
  userScalable:  false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
