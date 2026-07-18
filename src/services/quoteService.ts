import { supabase } from '@/lib/supabase'
import { getMonthStart } from '@/lib/formatters'
import type { DashboardStats, Quote, QuoteFormData, QuoteItem } from '@/types'

export async function getNextQuoteNumber(): Promise<string> {
  const { data, error } = await supabase
    .from('quotes')
    .select('quote_number')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw error

  if (!data || data.length === 0) return '001'

  const last = parseInt(data[0].quote_number, 10)
  return String(isNaN(last) ? 1 : last + 1).padStart(3, '0')
}

export async function getQuotes(filters?: {
  clientId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}): Promise<Quote[]> {
  let query = supabase
    .from('quotes')
    .select('*, client:clients(*), items:quote_items(*)')
    .order('created_at', { ascending: false })

  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId)
  }
  if (filters?.dateFrom) {
    query = query.gte('issue_date', filters.dateFrom)
  }
  if (filters?.dateTo) {
    query = query.lte('issue_date', filters.dateTo)
  }

  const { data, error } = await query
  if (error) throw error

  let quotes = data ?? []

  if (filters?.search) {
    const s = filters.search.toLowerCase()
    quotes = quotes.filter(
      (q) =>
        q.quote_number.toLowerCase().includes(s) ||
        q.client?.name?.toLowerCase().includes(s) ||
        q.notes?.toLowerCase().includes(s)
    )
  }

  return quotes
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*, client:clients(*), items:quote_items(*)')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getRecentQuotes(limit = 5): Promise<Quote[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*, client:clients(*)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const monthStart = getMonthStart()

  const [clientsRes, quotesRes, monthlyRes, valueRes] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('quotes').select('*', { count: 'exact', head: true }),
    supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .gte('issue_date', monthStart),
    supabase.from('quotes').select('total'),
  ])

  const totalValue = (valueRes.data ?? []).reduce(
    (sum, q) => sum + Number(q.total),
    0
  )

  return {
    totalClients: clientsRes.count ?? 0,
    totalQuotes: quotesRes.count ?? 0,
    monthlyQuotes: monthlyRes.count ?? 0,
    totalValue,
  }
}

function calculateTotals(items: QuoteItem[], discount: number) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const total = Math.max(0, subtotal - discount)
  return { subtotal, total }
}

export async function createQuote(formData: QuoteFormData): Promise<Quote> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const items = formData.items.map((item) => ({
    ...item,
    total: item.quantity * item.unit_price,
  }))
  const { subtotal, total } = calculateTotals(items, formData.discount)

  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .insert({
      user_id: user.id,
      client_id: formData.client_id,
      quote_number: formData.quote_number,
      issue_date: formData.issue_date,
      expiration_date: formData.expiration_date || null,
      subtotal,
      discount: formData.discount,
      total,
      notes: formData.notes || null,
    })
    .select()
    .single()

  if (quoteError) throw quoteError

  const itemsToInsert = items.map((item) => ({
    quote_id: quote.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.total,
  }))

  const { error: itemsError } = await supabase.from('quote_items').insert(itemsToInsert)
  if (itemsError) throw itemsError

  return getQuoteById(quote.id) as Promise<Quote>
}

export async function updateQuote(id: string, formData: QuoteFormData): Promise<Quote> {
  const items = formData.items.map((item) => ({
    ...item,
    total: item.quantity * item.unit_price,
  }))
  const { subtotal, total } = calculateTotals(items, formData.discount)

  const { error: quoteError } = await supabase
    .from('quotes')
    .update({
      client_id: formData.client_id,
      quote_number: formData.quote_number,
      issue_date: formData.issue_date,
      expiration_date: formData.expiration_date || null,
      subtotal,
      discount: formData.discount,
      total,
      notes: formData.notes || null,
    })
    .eq('id', id)

  if (quoteError) throw quoteError

  await supabase.from('quote_items').delete().eq('quote_id', id)

  const itemsToInsert = items.map((item) => ({
    quote_id: id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.total,
  }))

  const { error: itemsError } = await supabase.from('quote_items').insert(itemsToInsert)
  if (itemsError) throw itemsError

  return getQuoteById(id) as Promise<Quote>
}

export async function deleteQuote(id: string): Promise<void> {
  const { error } = await supabase.from('quotes').delete().eq('id', id)
  if (error) throw error
}

export async function duplicateQuote(id: string): Promise<Quote> {
  const original = await getQuoteById(id)
  if (!original) throw new Error('Orçamento não encontrado')

  const nextNumber = await getNextQuoteNumber()
  const today = new Date().toISOString().split('T')[0]
  const expiration = new Date()
  expiration.setDate(expiration.getDate() + 30)

  return createQuote({
    client_id: original.client_id,
    quote_number: nextNumber,
    issue_date: today,
    expiration_date: expiration.toISOString().split('T')[0],
    notes: original.notes ?? '',
    discount: original.discount,
    items: (original.items ?? []).map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
    })),
  })
}
