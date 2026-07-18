import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!mpToken) return res.status(503).end()

  const topic = req.query.topic ?? req.body?.type
  const paymentId = req.query.id ?? req.body?.data?.id

  if (!paymentId) return res.status(200).end()

  try {
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpToken}` },
    })

    if (!paymentRes.ok) return res.status(200).end()

    const payment = await paymentRes.json()

    if (payment.status !== 'approved') return res.status(200).end()

    const userId = payment.external_reference
    if (!userId) return res.status(200).end()

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    )

    await supabase.rpc('activate_subscription', { p_user_id: userId })

    await supabase
      .from('payments')
      .update({ status: 'approved' })
      .eq('user_id', userId)
      .eq('status', 'pending')

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(500).end()
  }
}
