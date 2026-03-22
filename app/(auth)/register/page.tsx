'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar username (Apenas letras, números e sublinhados)
    const cleanUsername = username.trim().toLowerCase();
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    
    if (!usernameRegex.test(cleanUsername)) {
      setError("O nome de usuário deve conter apenas letras, números e sublinhados (_), sem espaços.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else if (data.user) {
      router.push('/login?message=Verifique seu e-mail para confirmar a conta.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="glass-card p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary-500/20 text-primary-500 rounded-2xl mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-zinc-500 mt-1">Comece a compartilhar seus jogos hoje.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
              <User size={16} /> Nome de Usuário
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full" 
              placeholder="ex: game_dev_99" 
              required
            />
          </div>

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
            {loading ? 'Criando conta...' : 'Registrar'}
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-500 text-sm">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-primary-500 hover:underline">
            Faça login aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
