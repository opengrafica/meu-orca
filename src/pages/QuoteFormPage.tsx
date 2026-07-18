import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, Save, FileDown, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { NativeSelect } from '@/components/ui/native-select'
import { getClients } from '@/services/clientService'
import {
  getNextQuoteNumber, createQuote, updateQuote, getQuoteById,
} from '@/services/quoteService'
import { getProfile } from '@/services/profileService'
import { generateQuotePDF, buildQuoteFromForm } from '@/lib/pdfGenerator'
import { formatCurrency, todayISO, addDaysISO } from '@/lib/formatters'
import { useAuth } from '@/contexts/AuthContext'
import type { Client, QuoteFormData, QuoteItem } from '@/types'

const emptyItem = (): QuoteItem => ({
  description: '',
  quantity: 1,
  unit_price: 0,
  total: 0,
})

export function QuoteFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEditing = !!id

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [clientId, setClientId] = useState('')
  const [quoteNumber, setQuoteNumber] = useState('')
  const [issueDate, setIssueDate] = useState(todayISO())
  const [expirationDate, setExpirationDate] = useState(addDaysISO(30))
  const [notes, setNotes] = useState('')
  const [discount, setDiscount] = useState(0)
  const [items, setItems] = useState<QuoteItem[]>([emptyItem()])

  const selectedClient = clients.find((c) => c.id === clientId)
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }))

  useEffect(() => {
    const init = async () => {
      try {
        const clientsData = await getClients()
        setClients(clientsData)

        if (isEditing && id) {
          const quote = await getQuoteById(id)
          if (!quote) {
            toast.error('Orçamento não encontrado')
            navigate('/history')
            return
          }
          setClientId(quote.client_id)
          setQuoteNumber(quote.quote_number)
          setIssueDate(quote.issue_date)
          setExpirationDate(quote.expiration_date ?? addDaysISO(30))
          setNotes(quote.notes ?? '')
          setDiscount(Number(quote.discount))
          setItems(quote.items?.length ? quote.items : [emptyItem()])
        } else {
          const nextNum = await getNextQuoteNumber()
          setQuoteNumber(nextNum)
        }
      } catch {
        toast.error('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id, isEditing, navigate])

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev]
      const item = { ...updated[index], [field]: value }
      item.total = Number(item.quantity) * Number(item.unit_price)
      updated[index] = item
      return updated
    })
  }

  const addItem = () => setItems((prev) => [...prev, emptyItem()])

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const total = Math.max(0, subtotal - discount)

  const getFormData = (): QuoteFormData | null => {
    if (!clientId) {
      toast.error('Selecione um cliente')
      return null
    }
    const validItems = items.filter((i) => i.description.trim())
    if (validItems.length === 0) {
      toast.error('Adicione pelo menos um item')
      return null
    }
    return {
      client_id: clientId,
      quote_number: quoteNumber,
      issue_date: issueDate,
      expiration_date: expirationDate,
      notes,
      discount,
      items: validItems,
    }
  }

  const handleSave = async (andPdf = false) => {
    const formData = getFormData()
    if (!formData) return

    setSaving(true)
    try {
      let savedId = id
      if (isEditing && id) {
        await updateQuote(id, formData)
        toast.success('Orçamento atualizado!')
      } else {
        const created = await createQuote(formData)
        savedId = created.id
        toast.success('Orçamento criado!')
      }

      if (andPdf && savedId) {
        const [quote, profile] = await Promise.all([getQuoteById(savedId), getProfile()])
        if (quote) await generateQuotePDF(quote, profile)
        toast.success('PDF personalizado gerado!')
      }

      navigate('/history')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handlePdfPreview = async (download = false) => {
    const formData = getFormData()
    if (!formData || !user) return

    try {
      const profile = await getProfile()
      const quote = buildQuoteFromForm(formData, selectedClient, user.id)
      await generateQuotePDF(quote, profile, { preview: !download })
      if (download) toast.success('PDF personalizado baixado!')
      else toast.success('Pré-visualização aberta!')
    } catch {
      toast.error('Erro ao gerar PDF')
    }
  }

  const handleExportPDF = async () => {
    if (!isEditing || !id) {
      await handlePdfPreview(true)
      return
    }
    try {
      const [quote, profile] = await Promise.all([getQuoteById(id), getProfile()])
      if (!quote) return
      await generateQuotePDF(quote, profile)
      toast.success('PDF personalizado gerado!')
    } catch {
      toast.error('Erro ao gerar PDF')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? `Orçamento #${quoteNumber}` : 'Novo Orçamento'}
        description="Preencha os dados e gere PDF personalizado com sua logo"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handlePdfPreview(false)}>
              <Eye className="size-4" />
              Prévia PDF
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileDown className="size-4" />
              PDF Personalizado
            </Button>
            <Button variant="outline" onClick={() => handleSave(true)} disabled={saving}>
              <FileDown className="size-4" />
              Salvar + PDF
            </Button>
            <Button onClick={() => handleSave(false)} disabled={saving}>
              <Save className="size-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        }
      />

      {clients.length === 0 && (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          Você ainda não tem clientes.{' '}
          <Link to="/clients" className="text-primary font-medium hover:underline">
            Cadastre um cliente primeiro
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Dados do Orçamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Número</Label>
              <Input value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <NativeSelect
                value={clientId}
                onChange={setClientId}
                options={clientOptions}
                placeholder="Selecione um cliente..."
                disabled={clients.length === 0}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Validade</Label>
                <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Itens</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="size-4" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-12">
                <div className="sm:col-span-5">
                  <Input
                    placeholder="Descrição do serviço/produto"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    placeholder="Qtd"
                    min={0}
                    step={0.01}
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    placeholder="R$ unit."
                    min={0}
                    step={0.01}
                    value={item.unit_price || ''}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center sm:col-span-2">
                  <span className="text-sm font-semibold text-primary">{formatCurrency(item.total)}</span>
                </div>
                <div className="flex items-center sm:col-span-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt-4 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground text-sm">Desconto (R$)</span>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  className="w-32 text-right"
                  value={discount || ''}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex justify-between rounded-lg bg-primary/10 px-3 py-2 text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
