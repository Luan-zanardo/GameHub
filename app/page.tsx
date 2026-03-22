import GameCard from '@/components/game/GameCard';
import { supabase } from '@/lib/supabase';
import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getGames() {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar jogos:', error);
    return [];
  }

  return data;
}

export default async function Home() {
  const games = await getGames();

  return (
    <div className="space-y-10 pb-20">
      <section className="px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase">EXPLORE JOGOS</h1>
            <p className="text-zinc-500 text-sm">Descubra as últimas criações da comunidade indie.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-lg border border-white/5">
            <button className="px-4 py-1.5 bg-zinc-800 rounded-md font-medium text-xs text-white">RECENTES</button>
            <button className="px-4 py-1.5 text-zinc-500 hover:text-white transition-colors text-xs font-medium">POPULARES</button>
          </div>
        </div>

        {games && games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game: any) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
            <Gamepad2 size={48} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-zinc-500 font-medium text-lg">Nenhum jogo publicado ainda.</p>
            <Link href="/games/new" className="text-blue-500 hover:underline mt-2 inline-block">Seja o primeiro a publicar!</Link>
          </div>
        )}
      </section>
    </div>
  );
}
