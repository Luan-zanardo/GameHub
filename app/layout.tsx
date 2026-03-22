import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GameHub | Portal de Jogos",
  description: "Publique, explore e jogue jogos diretamente no seu navegador.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
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
