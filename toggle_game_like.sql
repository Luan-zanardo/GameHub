-- Function to atomically handle likes
CREATE OR REPLACE FUNCTION public.toggle_game_like(p_game_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_user_id UUID;
  v_is_liked BOOLEAN;
  v_game_record games%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'User not authenticated'; END IF;

  -- Get current game data, including the liked_by array
  SELECT * INTO v_game_record FROM public.games WHERE id = p_game_id;

  -- Check if the user has already liked the game
  v_is_liked := v_user_id = ANY(v_game_record.liked_by);

  IF v_is_liked THEN
    -- If already liked, remove the user's ID from the array
    UPDATE public.games
    SET liked_by = array_remove(liked_by, v_user_id)
    WHERE id = p_game_id;
    v_is_liked := false;
  ELSE
    -- If not liked, add the user's ID to the array
    UPDATE public.games
    SET liked_by = array_append(liked_by, v_user_id)
    WHERE id = p_game_id;
    v_is_liked := true;
  END IF;

  -- Update the likes_count based on the array length AFTER the update
  UPDATE public.games
  SET likes_count = COALESCE(array_length(liked_by, 1), 0)
  WHERE id = p_game_id;
  
  -- Return the new state
  RETURN jsonb_build_object('isLiked', v_is_liked, 'likesCount', COALESCE(array_length(v_game_record.liked_by, 1), 0) + CASE WHEN v_is_liked THEN 1 ELSE -1 END); -- Adjust count based on local logic for immediate feedback
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
