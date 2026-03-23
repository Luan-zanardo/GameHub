import Link from 'next/link';
import { Eye, Download, Heart } from 'lucide-react';
import { Game } from '@/lib/supabase';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <div className="glass-card flex flex-col h-full group-hover:ring-2 ring-primary-500/50">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={game.thumbnail_url || '/placeholder-game.jpg'} 
            alt={game.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
             {game.profiles?.avatar_url && (
              <img 
                src={game.profiles.avatar_url} 
                className="w-6 h-6 rounded-full border border-white/20 object-cover" 
                alt={game.profiles.username}
              />
            )}
            <span className="text-white text-xs font-bold truncate max-w-[120px]">
              @{game.profiles?.username || 'user'}
            </span>
          </div>
        </div>
        
        <div className="p-3 md:p-5 flex flex-col flex-grow bg-gradient-to-b from-transparent to-black/20">
          <h3 className="font-black text-sm md:text-xl mb-1 md:mb-2 group-hover:text-primary-400 transition-colors line-clamp-1 tracking-tight uppercase">
            {game.title}
          </h3>
          
          <p className="text-zinc-500 text-[10px] md:text-sm line-clamp-1 md:line-clamp-2 mb-3 md:mb-6 leading-relaxed">
            {game.description || 'Nenhuma descrição fornecida.'}
          </p>
          
          <div className="mt-auto flex items-center">
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-zinc-400">
              <span className="flex items-center gap-1 text-[9px] md:text-xs font-bold">
                <Eye size={12} className="text-primary-500" />
                {game.views_count}
              </span>
              <span className="flex items-center gap-1 text-[9px] md:text-xs font-bold">
                <Download size={12} className="text-primary-500" />
                {game.downloads_count}
              </span>
              <span className="flex items-center gap-1 text-[9px] md:text-xs font-bold">
                <Heart size={12} className="text-primary-500 fill-primary-500/20" />
                {game.likes_count || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
