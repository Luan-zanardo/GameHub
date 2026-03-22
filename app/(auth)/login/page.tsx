'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="glass-card p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary-500/20 text-primary-500 rounded-2xl mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold">Bem-vindo de volta!</h1>
          <p className="text-zinc-500 mt-1">Faça login para continuar sua jornada.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
              <Mail size={16} /> E-mail
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full" 
              placeholder="seu@email.com" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
              <Lock size={16} /> Senha
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full" 
              placeholder="••••••••" 
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button 
            type="submit" 
            className="btn-primary w-full py-3 mt-4" 
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-500 text-sm">
          Ainda não tem uma conta?{' '}
          <Link href="/register" className="text-primary-500 hover:underline">
            Crie sua conta agora
          </Link>
        </p>
      </div>
    </div>
  );
}
