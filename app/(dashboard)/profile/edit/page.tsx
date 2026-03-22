'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Camera, Globe, Github, Twitter, Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setUsername(profile.username || '');
          setBio(profile.bio || '');
          setAvatarUrl(profile.avatar_url || '');
          setWebsite(profile.website_url || '');
          setGithub(profile.github_url || '');
          setTwitter(profile.twitter_url || '');
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    // Validar username (Apenas letras, números e sublinhados)
    const cleanUsername = username.trim().toLowerCase();
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    
    if (!usernameRegex.test(cleanUsername)) {
      alert("O nome de usuário deve conter apenas letras, números e sublinhados (_), sem espaços.");
      return;
    }

    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada. Faça login novamente.');

      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        finalAvatarUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: cleanUsername,
          bio,
          avatar_url: finalAvatarUrl,
          website_url: website,
          github_url: github,
          twitter_url: twitter,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      // Sucesso
      router.refresh();
      setTimeout(() => {
        router.push(`/user/${cleanUsername}`);
      }, 500);
      
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert(error.message || 'Erro ao salvar perfil');
      setSaving(false); // Só volta o botão se der erro, se der sucesso o redirect cuida
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-zinc-500">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Perfil</h1>
            <p className="text-zinc-500 text-sm">Personalize sua identidade no GameHub.</p>
          </div>
        </div>
        <Link href={`/user/${username}`} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Voltar
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar Section */}
        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 flex flex-col items-center gap-6">
          <div className="relative group">
            <img 
              src={avatarFile ? URL.createObjectURL(avatarFile) : (avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`)} 
              className="w-32 h-32 rounded-3xl object-cover border-4 border-zinc-800 shadow-2xl transition-transform group-hover:scale-105"
              alt="Avatar Preview"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="text-white" size={32} />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">Foto de Perfil</p>
            <p className="text-xs text-zinc-500 mt-1">Clique para alterar (PNG, JPG)</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Seu nome de usuário (@)</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full" 
                placeholder="seu_username"
                required
              />
              <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-wider">Isso mudará a URL do seu perfil</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Sua Biografia</label>
              <textarea 
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full resize-none" 
                placeholder="Fale sobre sua paixão por games..."
              />
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Links Sociais (Opcionais)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <Globe size={16} /> Website Personal
                </label>
                <input 
                  type="url" 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full text-sm" 
                  placeholder="https://meusite.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <Github size={16} /> GitHub Username
                </label>
                <input 
                  type="text" 
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full text-sm" 
                  placeholder="ex: github_user"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                  <Twitter size={16} /> Twitter / X (@)
                </label>
                <input 
                  type="text" 
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full text-sm" 
                  placeholder="ex: twitter_user"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>Salvando alterações...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Salvar Perfil</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
