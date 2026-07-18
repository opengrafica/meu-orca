import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Trash2, FileDown, Pencil } from 'lucide-react'
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
import { NativeSelect } from '@/components/ui/native-select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getQuotes, deleteQuote, duplicateQuote } from '@/services/quoteService'
import { getClients } from '@/services/clientService'
import { getProfile } from '@/services/profileService'
import { generateQuotePDF } from '@/lib/pdfGenerator'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Client, Quote } from '@/types'

export function HistoryPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search)

  const loadData = async () => {
    try {
      const [quotesData, clientsData] = await Promise.all([
        getQuotes({
          clientId: clientFilter === 'all' ? undefined : clientFilter,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          search: debouncedSearch || undefined,
        }),
        getClients(),
      ])
      setQuotes(quotesData)
      setClients(clientsData)
    } catch {
      toast.error('Erro ao carregar orçamentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [clientFilter, dateFrom, dateTo, debouncedSearch])

  const handleDuplicate = async (id: string) => {
    try {
      const newQuote = await duplicateQuote(id)
      toast.success(`Orçamento #${newQuote.quote_number} criado!`)
      loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao duplicar')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteQuote(deleteId)
      toast.success('Orçamento excluído!')
      setDeleteId(null)
      loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  const handlePDF = async (quote: Quote) => {
    try {
      const profile = await getProfile()
      await generateQuotePDF(quote, profile)
      toast.success('PDF gerado!')
    } catch {
      toast.error('Erro ao gerar PDF')
    }
  }

  return (
    <div>
      <PageHeader
        title="Histórico"
        description="Todos os seus orçamentos"
        action={
          <Button render={<Link to="/quotes/new" />}>
            Novo Orçamento
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Pesquisar..." />
        <NativeSelect
          value={clientFilter}
          onChange={setClientFilter}
          options={[
            { value: 'all', label: 'Todos os clientes' },
            ...clients.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
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
        <EmptyState
          title="Nenhum orçamento encontrado"
          description="Crie seu primeiro orçamento profissional"
          action={<Button render={<Link to="/quotes/new" />}>Criar Orçamento</Button>}
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-36">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">#{quote.quote_number}</TableCell>
                  <TableCell>{quote.client?.name ?? '—'}</TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(quote.issue_date)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{formatCurrency(quote.total)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" render={<Link to={`/quotes/${quote.id}/edit`} />}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handlePDF(quote)}>
                        <FileDown className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDuplicate(quote.id)}>
                        <Copy className="size-3.5" />
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
