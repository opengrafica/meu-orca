import { supabase } from '@/lib/supabase'
import type { Client, Profile, Quote } from '@/types'

export interface AdminStats {
  totalUsers: number
  totalClients: number
  totalQuotes: number
  totalRevenue: number
}

export interface ClientWithOwner extends Client {
  owner?: Profile | null
}

export interface QuoteWithOwner extends Quote {
  owner?: Profile | null
}

export async function getAdminStats(): Promise<AdminStats> {
  const [usersRes, clientsRes, quotesRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('quotes').select('total'),
  ])

  const totalRevenue = (quotesRes.data ?? []).reduce(
    (sum, q) => sum + Number(q.total),
    0
  )

  return {
    totalUsers: usersRes.count ?? 0,
    totalClients: clientsRes.count ?? 0,
    totalQuotes: quotesRes.data?.length ?? 0,
    totalRevenue,
  }
}

export async function getAllUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAllClients(search?: string): Promise<ClientWithOwner[]> {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  const { data: profiles } = await supabase.from('profiles').select('*')
  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]))

  let result = (clients ?? []).map((c) => ({
    ...c,
    owner: profileMap.get(c.user_id) ?? null,
  }))

  if (search) {
    const s = search.toLowerCase()
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.phone?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.owner?.company_name?.toLowerCase().includes(s) ||
        c.owner?.email?.toLowerCase().includes(s)
    )
  }

  return result
}

export async function getAllQuotes(filters?: {
  search?: string
  dateFrom?: string
  dateTo?: string
}): Promise<QuoteWithOwner[]> {
  let query = supabase
    .from('quotes')
    .select('*, client:clients(*), items:quote_items(*)')
    .order('created_at', { ascending: false })

  if (filters?.dateFrom) query = query.gte('issue_date', filters.dateFrom)
  if (filters?.dateTo) query = query.lte('issue_date', filters.dateTo)

  const { data: quotes, error } = await query
  if (error) throw error

  const { data: profiles } = await supabase.from('profiles').select('*')
  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]))

  let result = (quotes ?? []).map((q) => ({
    ...q,
    owner: profileMap.get(q.user_id) ?? null,
  }))

  if (filters?.search) {
    const s = filters.search.toLowerCase()
    result = result.filter(
      (q) =>
        q.quote_number.toLowerCase().includes(s) ||
        q.client?.name?.toLowerCase().includes(s) ||
        q.owner?.company_name?.toLowerCase().includes(s) ||
        q.owner?.email?.toLowerCase().includes(s)
    )
  }

  return result
}

export async function adminDeleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}

export async function adminDeleteQuote(id: string): Promise<void> {
  const { error } = await supabase.from('quotes').delete().eq('id', id)
  if (error) throw error
}
