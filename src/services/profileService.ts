import { supabase } from '@/lib/supabase'
import type { Profile, ProfileFormData } from '@/types'

export async function getProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateProfile(profile: ProfileFormData): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('user_id', user.id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLogoUrl(logoUrl: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { error } = await supabase
    .from('profiles')
    .update({ logo_url: logoUrl })
    .eq('user_id', user.id)
  if (error) throw error
}
