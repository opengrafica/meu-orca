import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, UserCircle, FileText, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAdminStats, getAllQuotes } from '@/services/adminService'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { AdminStats } from '@/services/adminService'
import type { QuoteWithOwner } from '@/services/adminService'

function StatCard({ title, value, icon: Icon, loading }: {
  title: string
  value: string | number
  icon: typeof Users
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-bold">{value}</p>}
      </CardContent>
    </Card>
  )
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentQuotes, setRecentQuotes] = useState<QuoteWithOwner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAdminStats(), getAllQuotes()])
      .then(([statsData, quotes]) => {
        setStats(statsData)
        setRecentQuotes(quotes.slice(0, 8))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="Painel Administrativo"
        description="Visão geral de todos os usuários, clientes e vendas"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Usuários Cadastrados" value={stats?.totalUsers ?? 0} icon={UserCircle} loading={loading} />
        <StatCard title="Total de Clientes" value={stats?.totalClients ?? 0} icon={Users} loading={loading} />
        <StatCard title="Orçamentos/Vendas" value={stats?.totalQuotes ?? 0} icon={FileText} loading={loading} />
        <StatCard title="Valor Total" value={formatCurrency(stats?.totalRevenue ?? 0)} icon={DollarSign} loading={loading} />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vendas Recentes (todos os usuários)</CardTitle>
          <Button variant="outline" size="sm" render={<Link to="/admin/quotes" />}>
            Ver todas
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : recentQuotes.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">Nenhuma venda registrada ainda.</p>
          ) : (
            <div className="space-y-3">
              {recentQuotes.map((quote) => (
                <div key={quote.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">#{quote.quote_number} — {quote.client?.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {quote.owner?.company_name || quote.owner?.email || 'Usuário'} · {formatDate(quote.issue_date)}
                    </p>
                  </div>
                  <Badge variant="secondary">{formatCurrency(quote.total)}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
