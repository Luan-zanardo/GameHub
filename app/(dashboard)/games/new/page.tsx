'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Upload, Image as ImageIcon, FileArchive, CheckCircle2, Film, X, Plus } from 'lucide-react';

export default function NewGamePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGalleryFiles([...galleryFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnail || !gameFile) return alert('Por favor, selecione a thumbnail e o arquivo do jogo.');

    setLoading(true);
    setProgress(5);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');

      // 1. Upload Thumbnail
      const thumbExt = thumbnail.name.split('.').pop();
      const thumbPath = `${user.id}/${Date.now()}-thumb.${thumbExt}`;
      const { error: thumbError } = await supabase.storage.from('thumbnails').upload(thumbPath, thumbnail);
      if (thumbError) throw thumbError;
      const { data: { publicUrl: thumbUrl } } = supabase.storage.from('thumbnails').getPublicUrl(thumbPath);
      setProgress(20);

      // 2. Upload Game File (.zip)
      const fileExt = gameFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}-game.${fileExt}`;
      const { error: fileError } = await supabase.storage.from('games').upload(filePath, gameFile);
      if (fileError) throw fileError;
      const { data: { publicUrl: gameUrl } } = supabase.storage.from('games').getPublicUrl(filePath);
      setProgress(50);

      // 3. Upload Video (Opcional)
      let videoUrl = null;
      if (videoFile) {
        const videoExt = videoFile.name.split('.').pop();
        const videoPath = `${user.id}/${Date.now()}-video.${videoExt}`;
        const { error: vError } = await supabase.storage.from('games').upload(videoPath, videoFile);
        if (vError) throw vError;
        
        const { data: { publicUrl: vUrl } } = supabase.storage.from('games').getPublicUrl(videoPath);
        videoUrl = vUrl;
      }
      setProgress(70);

      // 4. Create Game Entry
      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
      const { data: game, error: dbError } = await supabase.from('games').insert({
        title,
        description,
        type: 'download',
        thumbnail_url: thumbUrl,
        file_url: gameUrl,
        video_url: videoUrl,
        user_id: user.id,
        slug
      }).select().single();

      if (dbError) throw dbError;

      // 5. Upload Gallery Images
      if (galleryFiles.length > 0) {
        for (const file of galleryFiles) {
          const gExt = file.name.split('.').pop();
          const gPath = `${user.id}/gallery/${Date.now()}-${Math.random().toString(36).substring(7)}.${gExt}`;
          const { error: gError } = await supabase.storage.from('thumbnails').upload(gPath, file);
          if (gError) throw gError;

          const { data: { publicUrl: gUrl } } = supabase.storage.from('thumbnails').getPublicUrl(gPath);
          const { error: galleryDbError } = await supabase.from('game_gallery').insert({ game_id: game.id, image_url: gUrl });
          if (galleryDbError) throw galleryDbError;
        }
      }

      setProgress(100);
      router.push(`/games/${slug}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
          <Upload size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Publicar Jogo</h1>
          <p className="text-zinc-500 text-sm">Preencha os dados para compartilhar seu projeto.</p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-10">
        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 size={20} className="text-blue-500" /> Detalhes Gerais
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Título do Jogo</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg bg-zinc-950 border-white/5" 
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Descrição</label>
              <textarea 
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-950 border-white/5 resize-none" 
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Thumbnail */}
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ImageIcon size={16} /> Capa do Jogo
            </h2>
            <label className="aspect-video border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-zinc-900 transition-all cursor-pointer overflow-hidden relative group">
              {thumbnail ? (
                <img src={URL.createObjectURL(thumbnail)} className="w-full h-full object-cover" />
              ) : (
                <>
                  <Plus size={32} className="text-zinc-700" />
                  <span className="text-xs text-zinc-500 font-bold uppercase">Selecionar Imagem</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} />
            </label>
          </div>

          {/* Arquivo .zip */}
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileArchive size={16} /> Arquivo (.zip)
            </h2>
            <label className="aspect-video border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-zinc-900 transition-all cursor-pointer group">
              <FileArchive size={32} className={gameFile ? 'text-blue-500' : 'text-zinc-700'} />
              <div className="text-center px-4">
                <span className="text-xs font-bold text-zinc-400 block truncate max-w-full">
                  {gameFile ? gameFile.name : 'SUBIR ARQUIVO DO JOGO'}
                </span>
                <span className="text-[10px] text-zinc-600 mt-1 uppercase">Apenas formato .zip</span>
              </div>
              <input type="file" accept=".zip" className="hidden" onChange={(e) => setGameFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        {/* Video e Galeria */}
        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 space-y-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Film size={20} className="text-blue-500" /> Mídia Adicional
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-4 tracking-wide uppercase text-[10px]">Trailer ou Gameplay (Opcional)</label>
              <label className="w-full h-20 border border-white/5 bg-zinc-950 rounded-xl flex items-center px-6 gap-4 cursor-pointer hover:bg-zinc-900 transition-colors">
                <Film className="text-zinc-600" />
                <span className="text-sm text-zinc-500 flex-grow">{videoFile ? videoFile.name : 'Selecionar vídeo mp4...'}</span>
                <input type="file" accept="video/mp4" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-4 tracking-wide uppercase text-[10px]">Galeria de Imagens</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {galleryFiles.map((file, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-white/10">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="aspect-video border border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-zinc-900 cursor-pointer transition-colors">
                  <Plus size={20} className="text-zinc-600" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="space-y-2">
            <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
              <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-[10px] text-zinc-500 text-center uppercase font-bold tracking-widest">Enviando arquivos: {progress}%</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-5 text-xl uppercase tracking-widest font-black shadow-2xl">
          {loading ? <Loader2 className="animate-spin" /> : 'Publicar Jogo Agora'}
        </button>
      </form>
    </div>
  );
}

import { Loader2 } from 'lucide-react';
