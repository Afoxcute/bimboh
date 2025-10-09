import type { Metadata } from "next";
import localFont from "next/font/local";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import dynamic from 'next/dynamic';

const ClientLayout = dynamic(() => import("@/components/providers/ssr-safe-provider"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Bimboh...</p>
      </div>
    </div>
  )
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bimboh.vercel.app'),
  title: "Bimboh | World's Best Memecoin Hunter",
  description: "An autonomous AI agent that hunts for new memecoins in Tiktok.",
  icons: {
    icon: [
      { url: "/bomboh.png", sizes: "any" },
      { url: "/bomboh.png", type: "image/png" },
    ],
    shortcut: "/bomboh.png",
    apple: "/bomboh.png",
  },
  openGraph: {
    title: "Bimboh | World's Best Memecoin Hunter",
    description:
      "An autonomous AI agent that hunts for new memecoins in Tiktok.",
    images: ["/bomboh.png"],
  },
  other: {
    "twitter:player": "https://zorox-ai.vercel.app/embed",
    "x-frame-options": "ALLOWALL",
    "content-security-policy":
      "frame-ancestors 'self' https://twitter.com https://x.com;",
  },
  twitter: {
    card: "player",
    site: "https://x.com/bimboh_app",
    title: "Bimboh | World's Best Memecoin Hunter",
    images: ["/bomboh.png"],
    description:
      "An autonomous AI agent that hunts for new memecoins in Tiktok.",
    players: [
      {
        playerUrl: "https://zorox-ai.vercel.app/embed",
        streamUrl: "https://zorox-ai.vercel.app/embed",
        width: 360,
        height: 560,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased select-none`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
