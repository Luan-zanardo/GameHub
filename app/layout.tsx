import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GameHub",
  description: "Publique, explore e jogue jogos diretamente no seu navegador.",

  // Ícone da aba (favicon)
  icons: {
    icon: "/pepe.png",
  },

  // Preview quando compartilhar link (WhatsApp, Discord, etc)
  openGraph: {
    title: "GameHub",
    description: "Publique, explore e jogue jogos diretamente no seu navegador.",
    url: "https://seusite.com", // depois troca pelo domínio real
    siteName: "GameHub",
    images: [
      {
        url: "/pepe.png",
        width: 1200,
        height: 630,
        alt: "GameHub",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },

  // Twitter preview (opcional, mas bom ter)
  twitter: {
    card: "summary_large_image",
    title: "GameHub",
    description: "Publique, explore e jogue jogos diretamente no seu navegador.",
    images: ["/pepe.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}
      >
        <Navbar />

        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-zinc-800 py-8 text-center text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} GameHub - Todos os direitos reservados.
        </footer>
      </body>
    </html>
  );
}