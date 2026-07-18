export interface Profile {
  id: string
  user_id: string
  company_name: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  logo_url: string | null
  created_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  phone: string | null
  email: string | null
  company: string | null
  notes: string | null
  created_at: string
}

export interface Quote {
  id: string
  user_id: string
  client_id: string
  quote_number: string
  issue_date: string
  expiration_date: string | null
  subtotal: number
  discount: number
  total: number
  notes: string | null
  created_at: string
  client?: Client
  items?: QuoteItem[]
}

export interface QuoteItem {
  id?: string
  quote_id?: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface QuoteFormData {
  client_id: string
  quote_number: string
  issue_date: string
  expiration_date: string
  notes: string
  discount: number
  items: QuoteItem[]
}

export interface DashboardStats {
  totalClients: number
  totalQuotes: number
  monthlyQuotes: number
  totalValue: number
}

export interface ClientFormData {
  name: string
  phone: string
  email: string
  company: string
  notes: string
}

export interface ProfileFormData {
  company_name: string
  phone: string
  email: string
  address: string
  city: string
  state: string
}
