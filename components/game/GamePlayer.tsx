'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Download, Film, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function GamePlayer({ game }: { game: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewCounted = useRef(false);

  useEffect(() => {
    // Impedir contagem dupla em Strict Mode e por sessão
    if (viewCounted.current) return;

    const sessionKey = `viewed_${game.id}`;
    const hasViewed = sessionStorage.getItem(sessionKey);

    if (!hasViewed) {
      viewCounted.current = true;
      supabase.rpc('increment_views', { p_game_id: game.id })
        .then(() => {
          sessionStorage.setItem(sessionKey, 'true');
        })
        .catch(err => {
          console.error('Erro ao contar view:', err);
          viewCounted.current = false; // Resetar em caso de erro para tentar novamente
        });
    } else {
      viewCounted.current = true;
    }
  }, [game.id]);
  
  // Criar lista de mídias: [Vídeo?, Thumbnail, ...Galeria]
  const mediaList = [
    ...(game.video_url ? [{ type: 'video', url: game.video_url }] : []),
    { type: 'image', url: game.thumbnail_url },
    ...(game.game_gallery?.map((img: any) => ({ type: 'image', url: img.image_url })) || [])
  ];

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaList.length);
    setIsPlaying(false);
  };

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
    setIsPlaying(false);
  };

  const currentMedia = mediaList[currentIndex];
  const isZip = game.file_url?.endsWith('.zip');

  return (
    <div className="w-full space-y-4 md:space-y-6 overflow-hidden">
      <section className="glass-card overflow-hidden bg-black aspect-video relative flex flex-col items-center justify-center shadow-2xl rounded-2xl md:rounded-3xl border border-white/5 group">
        {game.type === 'webgl' && !isZip && isPlaying ? (
          <iframe 
            src={game.file_url} 
            className="w-full h-full border-none"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Content based on current media - FULL CONTAINER */}
            <div className="absolute inset-0 w-full h-full">
              {currentMedia.type === 'video' ? (
                <video 
                  key={currentMedia.url}
                  src={currentMedia.url} 
                  controls 
                  className="w-full h-full object-cover bg-black"
                />
              ) : (
                <div className="w-full h-full relative">
                  <img 
                    src={currentMedia.url} 
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Play Button Overlay only for Thumbnail/Webgl */}
                  {currentIndex === (game.video_url ? 1 : 0) && game.type === 'webgl' && !isZip && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <button 
                        onClick={() => setIsPlaying(true)}
                        className="btn-primary px-6 md:px-10 py-3 md:py-4 text-sm md:text-xl shadow-2xl shadow-blue-500/40 rounded-full flex items-center gap-2 md:gap-3 transform transition hover:scale-105 active:scale-95"
                      >
                        <Play size={20} className="md:w-7 md:h-7" fill="currentColor" /> 
                        <span className="font-black italic uppercase">Iniciar</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Arrows - Optimized for Mobile */}
            {mediaList.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-4 z-30 pointer-events-none">
                <button 
                  onClick={prevMedia}
                  className="p-2 md:p-4 bg-black/40 backdrop-blur-md hover:bg-primary-500 text-white rounded-xl md:rounded-2xl transition-all pointer-events-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 shadow-xl border border-white/10"
                >
                  <ChevronLeft size={24} className="md:w-8 md:h-8" />
                </button>
                <button 
                  onClick={nextMedia}
                  className="p-2 md:p-4 bg-black/40 backdrop-blur-md hover:bg-primary-500 text-white rounded-xl md:rounded-2xl transition-all pointer-events-auto opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 shadow-xl border border-white/10"
                >
                  <ChevronRight size={24} className="md:w-8 md:h-8" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Media Selector (Thumbnails) - Fixed overflow and size for Mobile */}
      <div className="w-full">
        <div className="flex items-center gap-3 overflow-x-auto py-2 px-1 no-scrollbar scroll-smooth">
          {mediaList.map((media, idx) => (
            <button 
              key={idx}
              onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }}
              className={`flex-shrink-0 w-24 md:w-32 aspect-video rounded-lg md:rounded-xl border-2 transition-all overflow-hidden relative group bg-zinc-900 ${currentIndex === idx ? 'border-primary-500 ring-2 md:ring-4 ring-primary-500/20 scale-105 z-10' : 'border-white/5 hover:border-white/20 opacity-60 hover:opacity-100'}`}
            >
              {media.type === 'video' ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-black/60">
                  <Film size={16} className="text-primary-500" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">Trailer</span>
                </div>
              ) : (
                <img src={media.url} className="w-full h-full object-cover" alt={`Media ${idx}`} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
