import { useEffect, useState } from 'react'
import { getProfile } from '@/services/profileService'
import { isSubscriptionActive } from '@/services/subscriptionService'
import { useAuth } from '@/contexts/AuthContext'
import type { Profile } from '@/types'

export function useSubscription() {
  const { user, isAdmin } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    getProfile()
      .then(setProfile)
      .finally(() => setLoading(false))
  }, [user])

  const active = isAdmin || isSubscriptionActive(profile)
  const expiresAt = profile?.subscription_expires_at ?? null
  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000))
    : 0

  return { active, loading, expiresAt, daysLeft, profile }
}
