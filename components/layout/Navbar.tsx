'use client';

import Link from 'next/link';
import { PlusSquare, LogOut, Gamepad2, Search as SearchIcon, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';
import Search from './Search';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    setIsMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    }
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
      if (data) setProfile(data);
    } catch (error) {
      console.error('Erro ao buscar perfil na Navbar:', error);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (isAuthPage) {
    return (
      <nav className="h-20 flex items-center justify-center bg-transparent">
        <Link href="/" className="flex items-center gap-2 text-2xl font-black text-white hover:text-blue-500 transition-colors">
          <img src="/pepe.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span>GameHub</span>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="h-16 flex items-center bg-zinc-950/50 border-b border-white/5 sticky top-0 z-[100] backdrop-blur-md">
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        {/* Logo */}
        {!isMobileSearchOpen && (
          <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:text-blue-500 transition-colors shrink-0">
            <img src="/pepe.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="tracking-tighter font-black">GameHub</span>
          </Link>
        )}

        {/* Desktop Search */}
        <div className="flex-grow max-w-lg hidden md:block">
          <Search />
        </div>

        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div className="flex-grow flex items-center gap-2 md:hidden">
            <Search />
            <button 
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-2 text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Actions */}
        {!isMobileSearchOpen && (
          <div className="flex items-center gap-1 sm:gap-4">
            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <SearchIcon size={20} />
            </button>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-1 sm:gap-4">
                    <Link href="/games/new" className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full" title="Publicar">
                      <PlusSquare size={22} />
                    </Link>
                    
                    <NotificationBell userId={user.id} />
                    
                    <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                    
                    <Link 
                      href={profile?.username ? `/user/${profile.username}` : '#'} 
                      className="flex items-center gap-3 group bg-zinc-900 hover:bg-zinc-800 py-1 pl-1 pr-3 rounded-full transition-all border border-white/5"
                    >
                      <img 
                        src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'user'}`} 
                        alt={profile?.username || 'User'}
                        className="w-7 h-7 rounded-full object-cover bg-zinc-800"
                      />
                      <span className="text-xs sm:text-sm font-medium text-zinc-300 group-hover:text-white max-w-[60px] md:max-w-[120px] truncate">
                        {profile?.username || 'Perfil'}
                      </span>
                    </Link>

                    <button 
                      onClick={handleLogout}
                      className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 hover:text-red-500"
                      title="Sair"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login" className="px-3 py-2 text-zinc-400 hover:text-white text-xs sm:text-sm font-medium">
                      Entrar
                    </Link>
                    <Link href="/register" className="btn-primary !py-1.5 !px-3 sm:!px-4 text-xs sm:text-sm !rounded-md">
                      Criar Conta
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

