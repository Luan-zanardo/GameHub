import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Game = {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  file_url: string;
  video_url?: string;
  type: 'webgl' | 'download';
  created_at: string;
  views_count: number;
  downloads_count: number;
  likes_count: number;
  liked_by: string[];
  profiles?: Profile;
  game_gallery?: { image_url: string }[];
};

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  updated_at: string;
};
