import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export function isSubscriptionActive(profile: Profile | null): boolean {
  if (!profile?.subscription_expires_at) return false
  return new Date(profile.subscription_expires_at) > new Date()
}

export async function getSubscriptionStatus(): Promise<{
  active: boolean
  expiresAt: string | null
  daysLeft: number
}> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { active: false, expiresAt: null, daysLeft: 0 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_expires_at')
    .eq('user_id', user.id)
    .single()

  if (!profile?.subscription_expires_at) {
    return { active: false, expiresAt: null, daysLeft: 0 }
  }

  const expires = new Date(profile.subscription_expires_at)
  const now = new Date()
  const active = expires > now
  const daysLeft = active
    ? Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return {
    active,
    expiresAt: profile.subscription_expires_at,
    daysLeft,
  }
}

export async function createCheckoutPreference(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Faça login para continuar')

  const response = await fetch('/api/create-preference', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error ?? 'Erro ao iniciar pagamento')
  }

  const data = await response.json()
  return data.init_point as string
}
