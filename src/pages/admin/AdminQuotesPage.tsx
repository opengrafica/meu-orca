import { useEffect, useState } from 'react'
import { Trash2, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getAllQuotes, adminDeleteQuote } from '@/services/adminService'
import { getProfile } from '@/services/profileService'
import { generateQuotePDF } from '@/lib/pdfGenerator'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { QuoteWithOwner } from '@/services/adminService'

export function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search)

  const load = () => {
    setLoading(true)
    getAllQuotes({
      search: debouncedSearch || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
      .then(setQuotes)
      .catch(() => toast.error('Erro ao carregar vendas'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [debouncedSearch, dateFrom, dateTo])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await adminDeleteQuote(deleteId)
      toast.success('Orçamento excluído')
      setDeleteId(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  const handlePDF = async (quote: QuoteWithOwner) => {
    try {
      const profile = quote.owner ?? (await getProfile())
      await generateQuotePDF(quote, profile)
      toast.success('PDF gerado')
    } catch {
      toast.error('Erro ao gerar PDF')
    }
  }

  return (
    <div>
      <PageHeader title="Todas as Vendas" description="Orçamentos e vendas de todos os usuários" />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Pesquisar..." />
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">De</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Até</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : quotes.length === 0 ? (
        <EmptyState title="Nenhuma venda encontrada" />
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden sm:table-cell">Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">#{quote.quote_number}</TableCell>
                  <TableCell>{quote.client?.name ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {quote.owner?.company_name || quote.owner?.email || '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(quote.issue_date)}</TableCell>
                  <TableCell>{formatCurrency(quote.total)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => handlePDF(quote)}>
                        <FileDown className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(quote.id)}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
