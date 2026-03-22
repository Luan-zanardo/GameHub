'use client';

import { useState, useEffect } from 'react';
import { Play, Download, Film, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GamePlayer({ game }: { game: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
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
    <div className="space-y-6">
      <section className="glass-card overflow-hidden bg-black aspect-video relative flex flex-col items-center justify-center shadow-2xl rounded-3xl border border-white/5 group">
        {game.type === 'webgl' && !isZip && isPlaying ? (
          <iframe 
            src={game.file_url} 
            className="w-full h-full border-none"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
            {/* Background Blur */}
            <img 
              src={currentMedia.url} 
              alt={game.title}
              className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 transition-all duration-500"
            />

            {/* Content based on current media */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-12">
              {currentMedia.type === 'video' ? (
                <video 
                  key={currentMedia.url}
                  src={currentMedia.url} 
                  controls 
                  className="w-full h-full rounded-2xl shadow-2xl object-contain bg-black"
                />
              ) : (
                <div className="flex flex-col items-center w-full h-full justify-center">
                  <img 
                    src={currentMedia.url} 
                    alt={game.title}
                    className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain border border-white/10"
                  />
                  
                  {/* Play Button Overlay only for Thumbnail/Webgl */}
                  {currentIndex === (game.video_url ? 1 : 0) && game.type === 'webgl' && !isZip && (
                    <button 
                      onClick={() => setIsPlaying(true)}
                      className="absolute inset-0 m-auto w-fit h-fit btn-primary px-10 py-4 text-xl shadow-lg shadow-blue-500/20 rounded-full flex items-center gap-2"
                    >
                      <Play size={24} /> INICIAR JOGO
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {mediaList.length > 1 && (
              <>
                <button 
                  onClick={prevMedia}
                  className="absolute left-4 z-20 p-3 bg-black/50 hover:bg-blue-600 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextMedia}
                  className="absolute right-4 z-20 p-3 bg-black/50 hover:bg-blue-600 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        )}
      </section>

      {/* Media Selector (Thumbnails) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {mediaList.map((media, idx) => (
            <button 
              key={idx}
              onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }}
              className={`flex-shrink-0 w-28 aspect-video rounded-xl border-2 transition-all overflow-hidden relative group bg-zinc-900 ${currentIndex === idx ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white/5 hover:border-white/20'}`}
            >
              {media.type === 'video' ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <Film size={16} className="text-blue-500" />
                  <span className="text-[8px] font-bold uppercase">Trailer</span>
                </div>
              ) : (
                <img src={media.url} className="w-full h-full object-cover" alt={`Media ${idx}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {isZip && game.type === 'webgl' && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
            <Download size={20} />
          </div>
          <p className="text-sm text-blue-200/70">
            Este jogo WebGL está compactado e precisa ser baixado para execução local.
          </p>
        </div>
      )}
    </div>
  );
}
