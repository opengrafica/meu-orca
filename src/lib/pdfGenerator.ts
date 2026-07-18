import jsPDF from 'jspdf'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { PdfSettings, Profile, Quote } from '@/types'

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return [r || 37, g || 99, b || 235]
}

async function loadImage(url: string): Promise<{ data: string; format: string } | null> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const format = blob.type.includes('png') ? 'PNG' : blob.type.includes('jpeg') || blob.type.includes('jpg') ? 'JPEG' : 'PNG'
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve({ data: reader.result as string, format })
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export interface GeneratePdfOptions {
  profile: Profile | null
  settings?: PdfSettings
}

export async function generateQuotePDF(
  quote: Quote,
  profile: Profile | null,
  options?: { preview?: boolean }
): Promise<void> {
  const primaryColor = profile?.pdf_primary_color ?? '#2563eb'
  const [r, g, b] = hexToRgb(primaryColor)
  const footerText = profile?.pdf_footer_text?.trim() || 'Gerado com MeuOrça'
  const showWatermark = profile?.pdf_show_watermark !== false

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let y = 15

  // Header background
  doc.setFillColor(r, g, b)
  doc.rect(0, 0, pageWidth, 45, 'F')

  let textX = 15
  if (profile?.logo_url) {
    const img = await loadImage(profile.logo_url)
    if (img) {
      doc.addImage(img.data, img.format, 15, 8, 28, 28)
      textX = 48
    }
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(profile?.company_name ?? 'Minha Empresa', textX, 18)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const infoLines: string[] = []
  if (profile?.address) infoLines.push(profile.address)
  if (profile?.city && profile?.state) infoLines.push(`${profile.city} - ${profile.state}`)
  if (profile?.phone) infoLines.push(`Tel: ${profile.phone}`)
  if (profile?.email) infoLines.push(profile.email)
  infoLines.forEach((line, i) => doc.text(line, textX, 26 + i * 4.5))

  y = 55
  doc.setTextColor(0, 0, 0)

  // Quote title box
  doc.setFillColor(r, g, b)
  doc.roundedRect(15, y, pageWidth - 30, 14, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(`ORÇAMENTO Nº ${quote.quote_number}`, 20, y + 9)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Data: ${formatDate(quote.issue_date)}`, pageWidth - 20, y + 6, { align: 'right' })
  if (quote.expiration_date) {
    doc.text(`Validade: ${formatDate(quote.expiration_date)}`, pageWidth - 20, y + 11, { align: 'right' })
  }
  y += 22

  // Client box
  doc.setTextColor(0, 0, 0)
  doc.setDrawColor(r, g, b)
  doc.setLineWidth(0.3)
  doc.roundedRect(15, y, (pageWidth - 35) / 2, 28, 2, 2, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(r, g, b)
  doc.text('CLIENTE', 20, y + 7)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(quote.client?.name ?? '—', 20, y + 14)
  if (quote.client?.company) doc.text(quote.client.company, 20, y + 19)
  if (quote.client?.phone) doc.text(`Tel: ${quote.client.phone}`, 20, y + 24)

  const clientBox2X = 15 + (pageWidth - 35) / 2 + 5
  doc.roundedRect(clientBox2X, y, (pageWidth - 35) / 2, 28, 2, 2, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(r, g, b)
  doc.text('CONTATO', clientBox2X + 5, y + 7)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  if (quote.client?.email) doc.text(quote.client.email, clientBox2X + 5, y + 14)
  y += 36

  // Items table header
  doc.setFillColor(r, g, b)
  doc.rect(15, y, pageWidth - 30, 9, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('DESCRIÇÃO', 18, y + 6)
  doc.text('QTD', 115, y + 6)
  doc.text('UNIT.', 135, y + 6)
  doc.text('TOTAL', pageWidth - 18, y + 6, { align: 'right' })
  y += 11

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  const items = quote.items ?? []
  items.forEach((item, index) => {
    if (y > pageHeight - 50) {
      doc.addPage()
      y = 20
    }
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(15, y - 5, pageWidth - 30, 9, 'F')
    }
    const desc = doc.splitTextToSize(item.description, 90)
    doc.text(desc, 18, y)
    doc.text(String(item.quantity), 115, y)
    doc.text(formatCurrency(item.unit_price), 135, y)
    doc.text(formatCurrency(item.total), pageWidth - 18, y, { align: 'right' })
    y += Math.max(9, desc.length * 5)
  })

  y += 4
  doc.setDrawColor(220, 220, 220)
  doc.line(110, y, pageWidth - 15, y)
  y += 8

  doc.setFontSize(10)
  doc.text('Subtotal:', 130, y)
  doc.text(formatCurrency(quote.subtotal), pageWidth - 18, y, { align: 'right' })
  y += 6

  if (quote.discount > 0) {
    doc.text('Desconto:', 130, y)
    doc.setTextColor(220, 38, 38)
    doc.text(`- ${formatCurrency(quote.discount)}`, pageWidth - 18, y, { align: 'right' })
    doc.setTextColor(0, 0, 0)
    y += 6
  }

  doc.setFillColor(r, g, b)
  doc.roundedRect(110, y - 2, pageWidth - 125, 12, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL:', 115, y + 5)
  doc.text(formatCurrency(quote.total), pageWidth - 18, y + 5, { align: 'right' })
  y += 18

  doc.setTextColor(0, 0, 0)
  if (quote.notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(r, g, b)
    doc.text('OBSERVAÇÕES', 15, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.setFontSize(8)
    const notes = doc.splitTextToSize(quote.notes, pageWidth - 30)
    doc.text(notes, 15, y)
    y += notes.length * 4 + 8
  }

  // Footer
  doc.setDrawColor(r, g, b)
  doc.setLineWidth(0.5)
  doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20)
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text(footerText, pageWidth / 2, pageHeight - 12, { align: 'center' })
  if (showWatermark) {
    doc.setFontSize(7)
    doc.text('meu-orca.vercel.app', pageWidth / 2, pageHeight - 7, { align: 'center' })
  }

  const filename = `orcamento-${quote.quote_number}-${profile?.company_name?.replace(/\s+/g, '-').toLowerCase() ?? 'meuorca'}.pdf`

  if (options?.preview) {
    window.open(doc.output('bloburl'), '_blank')
  } else {
    doc.save(filename)
  }
}

export function buildQuoteFromForm(
  form: {
    client_id: string
    quote_number: string
    issue_date: string
    expiration_date: string
    notes: string
    discount: number
    items: { description: string; quantity: number; unit_price: number; total: number }[]
  },
  client: { name: string; phone?: string | null; email?: string | null; company?: string | null } | undefined,
  userId: string
): Quote {
  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  return {
    id: 'preview',
    user_id: userId,
    client_id: form.client_id,
    quote_number: form.quote_number,
    issue_date: form.issue_date,
    expiration_date: form.expiration_date,
    subtotal,
    discount: form.discount,
    total: Math.max(0, subtotal - form.discount),
    notes: form.notes,
    created_at: new Date().toISOString(),
    client: client ? {
      id: form.client_id,
      user_id: userId,
      name: client.name,
      phone: client.phone ?? null,
      email: client.email ?? null,
      company: client.company ?? null,
      notes: null,
      created_at: '',
    } : undefined,
    items: form.items,
  }
}
