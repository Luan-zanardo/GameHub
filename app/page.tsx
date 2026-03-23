import GameCard from '@/components/game/GameCard';
import { supabase } from '@/lib/supabase';
import { Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import GameFilters from '@/components/game/GameFilters';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getGames(sort: string) {
  let query = supabase
    .from('games')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `);

  // Lógica de ordenação
  switch (sort) {
    case 'views_desc':
      query = query.order('views_count', { ascending: false });
      break;
    case 'views_asc':
      query = query.order('views_count', { ascending: true });
      break;
    case 'downloads_desc':
      query = query.order('downloads_count', { ascending: false });
      break;
    case 'downloads_asc':
      query = query.order('downloads_count', { ascending: true });
      break;
    case 'likes_desc':
      query = query.order('likes_count', { ascending: false, nullsFirst: false });
      break;
    case 'likes_asc':
      query = query.order('likes_count', { ascending: true, nullsFirst: false });
      break;
    case 'recent':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar jogos:', error);
    return [];
  }

  return data;
}

export default async function Home({ searchParams }: { searchParams: { sort?: string } }) {
  const sort = searchParams.sort || 'recent';
  const games = await getGames(sort);

  return (
    <div className="space-y-10 pb-20">
      <section className="px-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-white/5">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">EXPLORE JOGOS</h1>
            <p className="text-zinc-500 text-sm font-medium">Descubra as últimas criações da comunidade indie.</p>
          </div>
          
          <GameFilters />
        </div>

        {games && games.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {games.map((game: any) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
            <Gamepad2 size={48} className="mx-auto text-zinc-800 mb-4" />
            <p className="text-zinc-500 font-bold text-xl uppercase tracking-widest">Nenhum jogo encontrado</p>
            <p className="text-zinc-600 mt-2">Tente mudar o filtro ou seja o primeiro a publicar!</p>
            <Link href="/games/new" className="btn-primary mt-8 inline-flex px-8 py-3 rounded-full">
              PUBLICAR MEU JOGO
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
