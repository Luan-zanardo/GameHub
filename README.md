# 🎮 GameHub

Plataforma web para publicar, explorar e jogar jogos diretamente no navegador.

## 🚀 Funcionalidades

- 👤 Sistema de usuários (login/cadastro)
- 🎮 Upload de jogos (WebGL ou executáveis)
- 🖼️ Thumbnail e vídeo para cada jogo
- ❤️ Sistema de curtidas
- 📥 Contador de downloads
- 👁️ Contador de visualizações
- 🔔 Sistema de notificações
- 👥 Sistema de seguidores

---

## 🛠️ Tecnologias

- Next.js
- TypeScript
- TailwindCSS
- Supabase (Auth + Database)

---

## 📦 Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/gamehub.git
cd gamehub
```
### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo .env.local na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

Você pode pegar essas informações no painel do Supabase.

### 4. Configure o banco de dados

- Acesse o Supabase
- Vá em SQL Editor
- Cole o script abaixo
- Execute

### SQL COMPLETO DO PROJETO

```SQL
-- =========================
-- TABELA: PROFILES
-- =========================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================
-- TABELA: GAMES
-- =========================
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  file_url TEXT NOT NULL,
  video_url TEXT,
  type TEXT DEFAULT 'webgl',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views_count BIGINT DEFAULT 0,
  downloads_count BIGINT DEFAULT 0,
  likes_count BIGINT DEFAULT 0,
  liked_by UUID[] DEFAULT '{}'
);

-- =========================
-- TABELA: NOTIFICATIONS
-- =========================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================
-- TABELA: FOLLOWS
-- =========================
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- =========================
-- FUNÇÕES
-- =========================
CREATE OR REPLACE FUNCTION public.increment_views(p_game_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  UPDATE public.games
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_game_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_downloads(p_game_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  UPDATE public.games
  SET downloads_count = COALESCE(downloads_count, 0) + 1
  WHERE id = p_game_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_game_like(p_game_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_is_liked BOOLEAN;
  v_likes_count BIGINT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  SELECT v_user_id = ANY(liked_by)
  INTO v_is_liked
  FROM public.games
  WHERE id = p_game_id;

  IF v_is_liked THEN
    UPDATE public.games
    SET liked_by = array_remove(liked_by, v_user_id),
        likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = p_game_id;
    v_is_liked := false;
  ELSE
    UPDATE public.games
    SET liked_by = array_append(liked_by, v_user_id),
        likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = p_game_id;
    v_is_liked := true;
  END IF;

  SELECT likes_count INTO v_likes_count
  FROM public.games
  WHERE id = p_game_id;

  RETURN jsonb_build_object(
    'isLiked', v_is_liked,
    'likesCount', v_likes_count
  );
END;
$$;

-- =========================
-- PERMISSÕES
-- =========================
GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_downloads(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_game_like(UUID) TO authenticated;
```

### 5. Rodar o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000
