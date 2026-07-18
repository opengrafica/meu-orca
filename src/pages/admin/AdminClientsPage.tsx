import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getAllClients, adminDeleteClient } from '@/services/adminService'
import { useDebounce } from '@/hooks/useDebounce'
import type { ClientWithOwner } from '@/services/adminService'

export function AdminClientsPage() {
  const [clients, setClients] = useState<ClientWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search)

  const load = () => {
    getAllClients(debouncedSearch || undefined)
      .then(setClients)
      .catch(() => toast.error('Erro ao carregar clientes'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [debouncedSearch])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await adminDeleteClient(deleteId)
      toast.success('Cliente excluído')
      setDeleteId(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  return (
    <div>
      <PageHeader title="Todos os Clientes" description="Clientes de todos os usuários do sistema" />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Pesquisar por nome, empresa ou usuário..." />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState title="Nenhum cliente encontrado" />
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="hidden sm:table-cell">E-mail</TableHead>
                <TableHead>Dono (Usuário)</TableHead>
                <TableHead className="w-16">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.phone || '—'}</TableCell>
                  <TableCell className="hidden sm:table-cell">{client.email || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {client.owner?.company_name || client.owner?.email || '—'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(client.id)}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
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
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação exclui o cliente permanentemente.</AlertDialogDescription>
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
