'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Bell, Trash2, CheckCircle2, Gamepad2, X } from 'lucide-react';
import Link from 'next/link';

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}` 
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*, profiles:actor_id(username, avatar_url), games:game_id(title, slug)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    setNotifications(data || []);
  }

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = async () => {
    await supabase.from('notifications').delete().eq('user_id', userId);
    setNotifications([]);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors hover:bg-zinc-800 rounded-full"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-[#0a0a0b]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)}></div>
          <div className="fixed left-4 right-4 top-20 md:absolute md:left-auto md:right-0 md:top-full md:mt-4 md:w-96 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[120] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-800/50">
              <h3 className="font-bold text-sm">Alertas de Seguidores</h3>
              <div className="flex gap-2">
                <button 
                  onClick={clearAll}
                  className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"
                  title="Limpar tudo"
                >
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="md:hidden p-1.5 text-zinc-500">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 border-b border-white/5 hover:bg-zinc-800/50 transition-colors relative group ${!n.is_read ? 'bg-blue-500/5' : ''}`}
                  >
                    <div className="flex gap-3">
                      <img 
                        src={n.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.profiles?.username}`} 
                        className="w-10 h-10 rounded-full border border-white/10 object-cover shrink-0"
                      />
                      <div className="flex-grow space-y-1">
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          <span className="font-bold text-white">@{n.profiles?.username}</span> acabou de lançar um novo jogo:
                        </p>
                        <Link 
                          href={`/games/${n.games?.slug}`}
                          onClick={() => { markAsRead(n.id); setIsOpen(false); }}
                          className="flex items-center gap-2 p-2 bg-black/30 rounded-lg text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors group/link"
                        >
                          <Gamepad2 size={14} />
                          <span className="truncate">{n.games?.title}</span>
                        </Link>
                        <p className="text-[10px] text-zinc-600 uppercase font-bold">{new Date(n.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.is_read && (
                        <button onClick={() => markAsRead(n.id)} className="text-zinc-500 hover:text-blue-500" title="Marcar como lida">
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n.id)} className="text-zinc-500 hover:text-red-500" title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-zinc-600 text-sm">
                  Nenhuma notificação por aqui.
                </div>
              )}
            </div>
            
            <div className="p-3 text-center bg-zinc-800/30">
               <button onClick={() => setIsOpen(false)} className="text-xs text-zinc-500 hover:text-white uppercase font-black tracking-widest transition-colors">Fechar Painel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
