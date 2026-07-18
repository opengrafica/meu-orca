import jsPDF from 'jspdf'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Profile, Quote } from '@/types'

async function loadImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function generateQuotePDF(quote: Quote, profile: Profile | null): Promise<void> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 20

  if (profile?.logo_url) {
    const imgData = await loadImage(profile.logo_url)
    if (imgData) {
      doc.addImage(imgData, 'PNG', 15, y, 30, 30)
    }
  }

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(profile?.company_name ?? 'Minha Empresa', profile?.logo_url ? 50 : 15, y + 10)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const companyInfo: string[] = []
  if (profile?.address) companyInfo.push(profile.address)
  if (profile?.city && profile?.state) companyInfo.push(`${profile.city} - ${profile.state}`)
  if (profile?.phone) companyInfo.push(`Tel: ${profile.phone}`)
  if (profile?.email) companyInfo.push(profile.email)

  companyInfo.forEach((line, i) => {
    doc.text(line, profile?.logo_url ? 50 : 15, y + 18 + i * 5)
  })

  y = 55
  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.5)
  doc.line(15, y, pageWidth - 15, y)
  y += 10

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Orçamento #${quote.quote_number}`, 15, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Data: ${formatDate(quote.issue_date)}`, 15, y)
  if (quote.expiration_date) {
    doc.text(`Validade: ${formatDate(quote.expiration_date)}`, pageWidth - 70, y)
  }
  y += 12

  doc.setFont('helvetica', 'bold')
  doc.text('Cliente:', 15, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.text(quote.client?.name ?? '—', 15, y)
  y += 5
  if (quote.client?.company) {
    doc.text(quote.client.company, 15, y)
    y += 5
  }
  if (quote.client?.phone) {
    doc.text(`Tel: ${quote.client.phone}`, 15, y)
    y += 5
  }
  if (quote.client?.email) {
    doc.text(quote.client.email, 15, y)
    y += 5
  }
  y += 8

  doc.setFillColor(37, 99, 235)
  doc.rect(15, y, pageWidth - 30, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Descrição', 17, y + 5.5)
  doc.text('Qtd', 110, y + 5.5)
  doc.text('Valor Unit.', 130, y + 5.5)
  doc.text('Total', pageWidth - 30, y + 5.5, { align: 'right' })
  y += 12

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')

  const items = quote.items ?? []
  items.forEach((item, index) => {
    if (y > 250) {
      doc.addPage()
      y = 20
    }

    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245)
      doc.rect(15, y - 4, pageWidth - 30, 8, 'F')
    }

    const desc = item.description.length > 50
      ? item.description.substring(0, 47) + '...'
      : item.description

    doc.text(desc, 17, y)
    doc.text(String(item.quantity), 110, y)
    doc.text(formatCurrency(item.unit_price), 130, y)
    doc.text(formatCurrency(item.total), pageWidth - 17, y, { align: 'right' })
    y += 8
  })

  y += 5
  doc.setDrawColor(200, 200, 200)
  doc.line(110, y, pageWidth - 15, y)
  y += 8

  doc.setFontSize(10)
  doc.text('Subtotal:', 130, y)
  doc.text(formatCurrency(quote.subtotal), pageWidth - 17, y, { align: 'right' })
  y += 6

  if (quote.discount > 0) {
    doc.text('Desconto:', 130, y)
    doc.text(`- ${formatCurrency(quote.discount)}`, pageWidth - 17, y, { align: 'right' })
    y += 6
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL:', 130, y)
  doc.setTextColor(37, 99, 235)
  doc.text(formatCurrency(quote.total), pageWidth - 17, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  y += 15

  if (quote.notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Observações:', 15, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const splitNotes = doc.splitTextToSize(quote.notes, pageWidth - 30)
    doc.text(splitNotes, 15, y)
    y += splitNotes.length * 5 + 10
  }

  const footerY = doc.internal.pageSize.getHeight() - 15
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text('Gerado com MeuOrça', pageWidth / 2, footerY, { align: 'center' })

  doc.save(`orcamento-${quote.quote_number}.pdf`)
}
