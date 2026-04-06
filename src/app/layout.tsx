import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { auth0 } from "@/lib/auth0";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "AI Site Builder",
    template: "%s | AI Site Builder",
  },
  description: "Construtor de sites com IA - Rápido e eficiente",
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

async function AuthBar() {
  if (!auth0) {
    return null;
  }

  const session = await auth0.getSession();

  return (
    <div className="border-b border-border/60 bg-card/80 px-4 py-2 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {session ? (
          <>
            <span>
              Conectado como{" "}
              <strong className="text-foreground">
                {session.user.name ?? session.user.email ?? "usuario"}
              </strong>
            </span>
            <a href="/auth/logout" className="text-primary hover:underline">
              Sair
            </a>
          </>
        ) : (
          <>
            <span>Entre para salvar briefs e geracoes no Neon.</span>
            <a href="/auth/login" className="text-primary hover:underline">
              Entrar com Auth0
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AuthBar />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
