-- 1. Cria a função para incrementar downloads
CREATE OR REPLACE FUNCTION public.increment_downloads(p_game_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.games
  SET downloads_count = COALESCE(downloads_count, 0) + 1
  WHERE id = p_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Remove a tabela e triggers antigos de likes (já foi feito, mas por segurança)
DROP TRIGGER IF EXISTS on_game_update_likes ON public.games;
DROP FUNCTION IF EXISTS public.sync_likes_count();
DROP TABLE IF EXISTS public.game_likes CASCADE;

-- 3. Remove a coluna liked_by da tabela games
ALTER TABLE public.games DROP COLUMN IF EXISTS liked_by;

-- 4. Garante que likes_count exista (se não foi adicionado antes)
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS likes_count BIGINT DEFAULT 0;

-- 5. Atualiza o contador de likes (para o caso de ter sido apagado e recriado sem dados)
-- Esta parte é mais para garantir a consistência caso a tabela game_likes tenha sido removida de forma inesperada
-- Se a tabela game_likes foi apagada e a coluna likes_count foi recriada, este comando não é estritamente necessário,
-- pois o contador será gerenciado pela nova lógica (ou ficará em 0 se não houver trigger/RPC).
-- Como estamos mudando a lógica para não usar mais game_likes, vamos garantir que likes_count reflete o que foi
-- explicitamente definido no código (ou 0 se não tiver sido).
-- Vamos confiar que o código do LikeButton vai atualizar likes_count diretamente na tabela games.
