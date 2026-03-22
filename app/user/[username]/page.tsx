import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProfileClient from './ProfileClient';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProfileData(username: string) {
  headers();
  
  // 1. Load Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) return null;

  // 2. Load User's Games
  const { data: games } = await supabase
    .from('games')
    .select('*, profiles:user_id(username, avatar_url)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  // 3. Load Followers (pessoas que seguem esse perfil)
  const { data: followers } = await supabase
    .from('follows')
    .select('follower_id, profiles:follower_id(username, avatar_url, bio)')
    .eq('following_id', profile.id);

  // 4. Load Following (pessoas que esse perfil segue)
  const { data: following } = await supabase
    .from('follows')
    .select('following_id, profiles:following_id(username, avatar_url, bio)')
    .eq('follower_id', profile.id);

  return { 
    profile, 
    games: games || [], 
    followers: followers?.map(f => f.profiles) || [],
    following: following?.map(f => f.profiles) || []
  };
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const data = await getProfileData(params.username);

  if (!data) notFound();

  const { data: { session } } = await supabase.auth.getSession();
  const currentUser = session?.user ?? null;

  return (
    <ProfileClient 
      profile={data.profile} 
      initialGames={data.games} 
      initialFollowers={data.followers}
      initialFollowing={data.following}
      currentUser={currentUser}
    />
  );
}
