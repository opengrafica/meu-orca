import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchInput } from '@/components/common/SearchInput'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getAllUsers } from '@/services/adminService'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/lib/formatters'
import type { Profile } from '@/types'

export function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((u) => {
    if (!debouncedSearch) return true
    const s = debouncedSearch.toLowerCase()
    return (
      u.email?.toLowerCase().includes(s) ||
      u.company_name?.toLowerCase().includes(s) ||
      u.phone?.toLowerCase().includes(s)
    )
  })

  return (
    <div>
      <PageHeader title="Usuários" description="Todos os usuários cadastrados no sistema" />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Pesquisar usuários..." />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Nenhum usuário encontrado" />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                <TableHead className="hidden md:table-cell">Cidade</TableHead>
                <TableHead>Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.company_name || '—'}</TableCell>
                  <TableCell>{user.email || '—'}</TableCell>
                  <TableCell className="hidden sm:table-cell">{user.phone || '—'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.city && user.state ? `${user.city} - ${user.state}` : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatDate(user.created_at.split('T')[0])}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
