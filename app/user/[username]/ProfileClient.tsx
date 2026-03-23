'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import GameCard from '@/components/game/GameCard';
import { Globe, Twitter, Github, UserPlus, UserMinus, Loader2, Gamepad2, Settings, Users } from 'lucide-react';
import Link from 'next/link';

export default function ProfileClient({ profile, initialGames, initialFollowers, initialFollowing, currentUser: initialUser }: any) {
  const [activeTab, setActiveTab] = useState<'games' | 'followers' | 'following'>('games');
  const [isFollowing, setIsFollowing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [followers, setFollowers] = useState(initialFollowers);
  const [following, setFollowing] = useState(initialFollowing);
  const [currentUser, setCurrentUser] = useState<any>(initialUser);

  useEffect(() => {
    async function initCheck() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setCurrentUser(user);

      if (user && user.id !== profile.id) {
        const { data } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)
          .single();
        setIsFollowing(!!data);
      }
    }
    initCheck();
  }, [profile.id]);

  const handleFollow = async () => {
    if (!currentUser) return alert('Faça login para seguir.');
    setActionLoading(true);
    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', profile.id);
        setIsFollowing(false);
        setFollowers(followers.filter((f: any) => f.username !== currentUser.user_metadata?.username));
      } else {
        const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: profile.id });
        setIsFollowing(true);
        if (myProfile) setFollowers([...followers, myProfile]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const isOwnProfile = currentUser?.id === profile.id;

  const UserList = ({ users }: { users: any[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {users.length > 0 ? users.map((u: any) => (
        <Link href={`/user/${u.username}`} key={u.username} className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-zinc-800 transition-all group">
          <img 
            src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
            className="w-12 h-12 rounded-full object-cover bg-zinc-800" 
            alt={u.username}
          />
          <div className="min-w-0">
            <p className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">@{u.username}</p>
            <p className="text-xs text-zinc-500 line-clamp-1">{u.bio || 'Membro do GameHub'}</p>
          </div>
        </Link>
      )) : (
        <div className="col-span-full py-20 text-center text-zinc-600 border border-dashed border-white/5 rounded-3xl">
          Nenhum usuário encontrado nesta lista.
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 px-4">
      {/* Header Profile */}
      <section className="flex flex-col items-center text-center pt-10 space-y-6">
        <img 
          src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
          alt={profile.username}
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-zinc-800 shadow-xl bg-zinc-900"
        />
        
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">@{profile.username}</h1>
          {profile.bio && <p className="text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">{profile.bio}</p>}
        </div>

        {/* Links Sociais */}
        {(profile.website_url || profile.github_url || profile.twitter_url) && (
          <div className="flex items-center justify-center gap-4">
            {profile.website_url && <a href={profile.website_url} target="_blank" className="p-2 bg-zinc-900 rounded-lg border border-white/5 text-zinc-400 hover:text-white transition-all hover:bg-zinc-800"><Globe size={18} /></a>}
            {profile.github_url && <a href={`https://github.com/${profile.github_url}`} target="_blank" className="p-2 bg-zinc-900 rounded-lg border border-white/5 text-zinc-400 hover:text-white transition-all hover:bg-zinc-800"><Github size={18} /></a>}
            {profile.twitter_url && <a href={`https://twitter.com/${profile.twitter_url}`} target="_blank" className="p-2 bg-zinc-900 rounded-lg border border-white/5 text-zinc-400 hover:text-white transition-all hover:bg-zinc-800"><Twitter size={18} /></a>}
          </div>
        )}

        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex items-center justify-center gap-2 sm:gap-8 w-full">
            <button onClick={() => setActiveTab('followers')} className="flex-1 sm:flex-none text-center hover:opacity-70 transition-opacity">
              <p className="text-xl font-black text-white">{followers.length}</p>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Seguidores</p>
            </button>
            <button onClick={() => setActiveTab('following')} className="flex-1 sm:flex-none text-center hover:opacity-70 transition-opacity">
              <p className="text-xl font-black text-white">{following.length}</p>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Seguindo</p>
            </button>
            <button onClick={() => setActiveTab('games')} className="flex-1 sm:flex-none text-center hover:opacity-70 transition-opacity">
              <p className="text-xl font-black text-white">{initialGames.length}</p>
              <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Jogos</p>
            </button>
          </div>

          <div className="w-full md:w-auto">
            {isOwnProfile ? (
              <Link href="/profile/edit" className="btn-secondary px-10 py-2.5 rounded-full flex items-center gap-2 hover:bg-zinc-800 border-white/10">
                <Settings size={18} /> Editar Perfil
              </Link>
            ) : (
              <button 
                onClick={handleFollow}
                disabled={actionLoading}
                className={`btn-primary px-12 py-2.5 rounded-full transition-all ${isFollowing ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10' : ''}`}
              >
                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : (isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />)}
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="space-y-8">
        <div className="flex items-center gap-6 md:gap-8 border-b border-white/5 pb-0 overflow-x-auto no-scrollbar scroll-smooth">
          <button onClick={() => setActiveTab('games')} className={`font-bold text-xs md:text-sm pb-4 border-b-2 transition-all whitespace-nowrap uppercase tracking-wider ${activeTab === 'games' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500'}`}>JOGOS ({initialGames.length})</button>
          <button onClick={() => setActiveTab('followers')} className={`font-bold text-xs md:text-sm pb-4 border-b-2 transition-all whitespace-nowrap uppercase tracking-wider ${activeTab === 'followers' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500'}`}>SEGUIDORES ({followers.length})</button>
          <button onClick={() => setActiveTab('following')} className={`font-bold text-xs md:text-sm pb-4 border-b-2 transition-all whitespace-nowrap uppercase tracking-wider ${activeTab === 'following' ? 'border-blue-500 text-white' : 'border-transparent text-zinc-500'}`}>SEGUINDO ({following.length})</button>
        </div>

        <div className="min-h-[300px]">
          {activeTab === 'games' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialGames.length > 0 ? initialGames.map((game: any) => <GameCard key={game.id} game={game} />) : <div className="col-span-full py-20 text-center bg-zinc-900/20 rounded-3xl border border-dashed border-white/5 text-zinc-500">Nenhum jogo publicado.</div>}
            </div>
          )}
          {activeTab === 'followers' && <UserList users={followers} />}
          {activeTab === 'following' && <UserList users={following} />}
        </div>
      </section>
    </div>
  );
}
