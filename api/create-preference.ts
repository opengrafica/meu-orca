import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Não autenticado' })

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Token inválido' })

  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  const appUrl = process.env.VITE_APP_URL ?? 'https://meu-orca.vercel.app'

  if (!mpToken) {
    return res.status(503).json({
      error: 'Pagamento não configurado. Configure MERCADOPAGO_ACCESS_TOKEN na Vercel.',
    })
  }

  const preference = {
    items: [
      {
        title: 'MeuOrça — Pagamento Único',
        description: 'Acesso completo por 1 ano — pagamento único de R$ 9,90',
        quantity: 1,
        unit_price: 9.9,
        currency_id: 'BRL',
      },
    ],
    payer: { email: user.email },
    back_urls: {
      success: `${appUrl}/pagamento/sucesso`,
      failure: `${appUrl}/pagamento/erro`,
      pending: `${appUrl}/pagamento/pendente`,
    },
    auto_return: 'approved',
    external_reference: user.id,
    notification_url: `${appUrl}/api/webhook/mercadopago`,
  }

  const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mpToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preference),
  })

  if (!mpRes.ok) {
    const err = await mpRes.text()
    console.error('MP error:', err)
    return res.status(500).json({ error: 'Erro ao criar pagamento' })
  }

  const data = await mpRes.json()

  await supabase.from('payments').insert({
    user_id: user.id,
    external_id: data.id,
    amount: 9.9,
    status: 'pending',
  })

  return res.status(200).json({
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
  })
}
