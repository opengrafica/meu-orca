import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, FileText, Calendar, DollarSign } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getDashboardStats, getRecentQuotes } from '@/services/quoteService'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { DashboardStats, Quote } from '@/types'

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
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardStats(), getRecentQuotes()])
      .then(([statsData, quotesData]) => {
        setStats(statsData)
        setRecentQuotes(quotesData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral dos seus orçamentos"
        action={
          <Button render={<Link to="/quotes/new" />}>
            Novo Orçamento
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de Clientes" value={stats?.totalClients ?? 0} icon={Users} loading={loading} />
        <StatCard title="Total de Orçamentos" value={stats?.totalQuotes ?? 0} icon={FileText} loading={loading} />
        <StatCard title="Orçamentos do Mês" value={stats?.monthlyQuotes ?? 0} icon={Calendar} loading={loading} />
        <StatCard title="Valor Total Orçado" value={formatCurrency(stats?.totalValue ?? 0)} icon={DollarSign} loading={loading} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Últimos Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : recentQuotes.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Nenhum orçamento ainda.{' '}
              <Link to="/quotes/new" className="text-primary hover:underline">
                Criar primeiro orçamento
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {recentQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">#{quote.quote_number}</p>
                    <p className="text-muted-foreground text-sm">
                      {quote.client?.name} · {formatDate(quote.issue_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{formatCurrency(quote.total)}</Badge>
                    <Button variant="outline" size="sm" render={<Link to={`/quotes/${quote.id}/edit`} />}>
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
