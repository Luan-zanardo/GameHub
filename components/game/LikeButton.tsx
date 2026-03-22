'use client';

import { useState, useEffect } from 'react';
import { Heart, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  gameId: string;
  initialLikes: number;
  likedBy: string[];
  fileUrl: string;
}

export default function LikeButton({ gameId, initialLikes, likedBy, fileUrl }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLikes(initialLikes);
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setIsLiked(likedBy.includes(user.id));
    };
    checkUser();
  }, [gameId, initialLikes, likedBy]);

  async function handleLike() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert('Você precisa estar logado!');

      setActionLoading(true);

      // Chamada RPC para a função inteligente que criamos no SQL
      const { data, error } = await supabase.rpc('handle_game_like', { 
        p_game_id: gameId 
      });

      if (error) throw error;

      // O banco retorna o estado exato e o contador real
      setLikes(data.likesCount);
      setIsLiked(data.isLiked);
      
      router.refresh();
    } catch (error: any) {
      alert('Erro ao processar like: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a 
        href={fileUrl} 
        download 
        className="btn-primary px-6 flex items-center gap-2"
      >
        <Download size={20} /> Baixar
      </a>
      
      <button 
        onClick={handleLike}
        disabled={actionLoading}
        className={`btn-secondary px-6 flex items-center gap-2 transition-all group ${isLiked ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-zinc-500'}`}
      >
        {actionLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Heart size={20} className={`${isLiked ? 'fill-current' : 'group-hover:scale-110 transition-transform'}`} />
        )}
        <span className="font-bold">{likes}</span>
      </button>
    </div>
  );
}
