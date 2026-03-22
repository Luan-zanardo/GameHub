'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, Loader2, Gamepad2, User as UserIcon, X } from 'lucide-react';
import { supabase, Game, Profile } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ games: Game[], profiles: Profile[] }>({ games: [], profiles: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch();
      } else {
        setResults({ games: [], profiles: [] });
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  async function performSearch() {
    setIsSearching(true);
    setIsOpen(true);

    try {
      // Search Games
      const { data: games } = await supabase
        .from('games')
        .select('id, title, slug, thumbnail_url, type')
        .ilike('title', `%${query}%`)
        .limit(5);

      // Search Profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(5);

      setResults({ 
        games: (games as any[]) || [], 
        profiles: (profiles as any[]) || [] 
      });
    } catch (error) {
      console.error('Erro na pesquisa:', error);
    } finally {
      setIsSearching(false);
    }
  }

  const handleSelect = () => {
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative group w-full" ref={dropdownRef}>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder="Buscar jogos ou usuários..." 
        className="w-full pl-10 pr-10 py-1.5 bg-zinc-900 border border-white/5 rounded-full text-sm focus:ring-1 focus:ring-blue-500/50 outline-none transition-all hover:bg-zinc-800"
      />
      {query && (
        <button 
          onClick={() => { setQuery(''); setResults({ games: [], profiles: [] }); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
        >
          <X size={14} />
        </button>
      )}

      {isOpen && (query.length >= 2) && (
        <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[200] backdrop-blur-xl bg-zinc-900/95">
          {isSearching ? (
            <div className="p-8 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-blue-500" size={24} />
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Buscando...</p>
            </div>
          ) : (results.games.length === 0 && results.profiles.length === 0) ? (
            <div className="p-8 text-center">
              <p className="text-zinc-500 text-sm">Nenhum resultado para "{query}"</p>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {/* Jogos */}
              {results.games.length > 0 && (
                <div className="p-2">
                  <h3 className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Jogos</h3>
                  {results.games.map((game) => (
                    <Link 
                      key={game.id} 
                      href={`/games/${game.slug}`}
                      onClick={handleSelect}
                      className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors group"
                    >
                      <div className="w-12 h-8 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-white/5">
                        <img src={game.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-bold text-white truncate">{game.title}</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">{game.type}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Usuários */}
              {results.profiles.length > 0 && (
                <div className="p-2 border-t border-white/5">
                  <h3 className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Usuários</h3>
                  {results.profiles.map((profile) => (
                    <Link 
                      key={profile.id} 
                      href={`/user/${profile.username}`}
                      onClick={handleSelect}
                      className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <img 
                        src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
                        className="w-8 h-8 rounded-full border border-white/10" 
                      />
                      <span className="text-sm font-bold text-white truncate">@{profile.username}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
