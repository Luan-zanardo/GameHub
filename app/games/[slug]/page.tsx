import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Eye, Download, Calendar } from 'lucide-react';
import Link from 'next/link';
import GamePlayer from '@/components/game/GamePlayer';
import LikeButton from '@/components/game/LikeButton';

export const revalidate = 0; // Garante dados sempre novos

async function getGame(slug: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*, profiles(username, avatar_url, bio), game_gallery(image_url)')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  // Increment views no servidor de forma rápida
  await supabase.rpc('increment_views', { game_id: data.id });

  return data;
}

export default async function GamePage({ params }: { params: { slug: string } }) {
  const game = await getGame(params.slug);

  if (!game) notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
      {/* Game Player Component (Client Side para interação) */}
      <GamePlayer game={game} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-4xl font-black tracking-tight">{game.title}</h1>
            <LikeButton 
              gameId={game.id} 
              initialLikes={game.likes_count || 0} 
              likedBy={game.liked_by || []}
              fileUrl={game.file_url} 
            />
          </div>

          <div className="flex items-center gap-6 text-zinc-500 text-sm border-y border-white/5 py-6">
            <span className="flex items-center gap-2">
              <Eye size={18} className="text-blue-500" /> <b>{game.views_count}</b> visualizações
            </span>
            <span className="flex items-center gap-2">
              <Download size={18} className="text-blue-500" /> <b>{game.downloads_count}</b> downloads
            </span>
            <span className="flex items-center gap-2">
              <Calendar size={18} /> {new Date(game.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl font-bold mb-4 text-white">Sobre o jogo</h2>
            <p className="text-zinc-400 whitespace-pre-wrap leading-relaxed text-lg">
              {game.description || 'Este jogo não possui uma descrição.'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Desenvolvedor</h3>
            <Link href={`/user/${game.profiles?.username}`} className="group flex items-center gap-4 p-2 -m-2 rounded-xl hover:bg-white/5 transition-all">
              <img 
                src={game.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${game.profiles?.username}`} 
                alt={game.profiles?.username}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/5 group-hover:ring-blue-500 transition-all"
              />
              <div className="min-w-0">
                <p className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors truncate">@{game.profiles?.username}</p>
                <p className="text-zinc-500 text-xs line-clamp-1">{game.profiles?.bio || 'Criador Indie'}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
