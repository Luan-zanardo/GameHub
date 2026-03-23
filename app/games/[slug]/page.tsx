import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Eye, Download, Calendar, Heart } from 'lucide-react';
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

  return data;
}

export default async function GamePage({ params }: { params: { slug: string } }) {
  const game = await getGame(params.slug);

  if (!game) notFound();

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-20 px-4 pt-4 md:pt-10">
      {/* Game Player Component */}
      <GamePlayer game={game} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white leading-tight">
              {game.title}
            </h1>
            <div className="shrink-0">
              <LikeButton 
                gameId={game.id} 
                initialLikes={game.likes_count || 0} 
                likedBy={game.liked_by || []}
                fileUrl={game.file_url} 
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-zinc-500 text-[11px] md:text-sm border-y border-white/5 py-6 uppercase font-bold tracking-wider">
            <span className="flex items-center gap-2">
              <Eye size={16} className="text-primary-500" /> <b className="text-white">{game.views_count}</b> <span className="hidden sm:inline">visualizações</span>
            </span>
            <span className="flex items-center gap-2">
              <Download size={16} className="text-primary-500" /> <b className="text-white">{game.downloads_count}</b> <span className="hidden sm:inline">downloads</span>
            </span>
            <span className="flex items-center gap-2">
              <Heart size={16} className="text-primary-500" /> <b className="text-white">{game.likes_count || 0}</b> <span className="hidden sm:inline">curtidas</span>
            </span>
            <span className="flex items-center gap-2 ml-auto">
              <Calendar size={16} /> {new Date(game.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl md:text-2xl font-black mb-4 text-white uppercase italic tracking-tight">Sobre o jogo</h2>
            <p className="text-zinc-400 whitespace-pre-wrap leading-relaxed text-sm md:text-lg">
              {game.description || 'Este jogo não possui uma descrição.'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-2xl">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6">Desenvolvedor</h3>
            <Link href={`/user/${game.profiles?.username}`} className="group flex items-center gap-4 p-3 -m-3 rounded-2xl hover:bg-white/5 transition-all">
              <img 
                src={game.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${game.profiles?.username}`} 
                alt={game.profiles?.username}
                className="w-12 h-12 md:w-16 md:h-16 rounded-2xl object-cover ring-2 ring-white/5 group-hover:ring-primary-500 transition-all shadow-lg"
              />
              <div className="min-w-0">
                <p className="font-black text-base md:text-xl text-white group-hover:text-primary-400 transition-colors truncate">@{game.profiles?.username}</p>
                <p className="text-zinc-500 text-[10px] md:text-xs line-clamp-1 font-bold uppercase tracking-tighter">{game.profiles?.bio || 'Criador Indie'}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
