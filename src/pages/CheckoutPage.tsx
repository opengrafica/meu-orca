import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { CreditCard, Check, Shield, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createCheckoutPreference } from '@/services/subscriptionService'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/contexts/AuthContext'

const benefits = [
  'Orçamentos ilimitados por 1 ano',
  'PDF personalizado com logo e cores',
  'Gestão completa de clientes',
  'Histórico e duplicação de orçamentos',
  'Acesso em celular e computador',
]

export function CheckoutPage() {
  const { user, loading: authLoading } = useAuth()
  const { active, daysLeft, loading } = useSubscription()
  const [paying, setPaying] = useState(false)

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handlePay = async () => {
    setPaying(true)
    try {
      const url = await createCheckoutPreference()
      window.location.href = url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao iniciar pagamento')
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (active) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
        <Check className="size-12 text-primary" />
        <h1 className="text-2xl font-bold">Assinatura ativa!</h1>
        <p className="text-muted-foreground">{daysLeft} dias restantes</p>
        <Button render={<Link to="/dashboard" />}>Ir para o Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CreditCard className="size-6" />
          </div>
          <CardTitle className="text-2xl">Ative o MeuOrça</CardTitle>
          <CardDescription>
            {daysLeft > 0
              ? `Seu trial termina em ${daysLeft} dias. Garanta mais 1 ano de acesso!`
              : 'Seu período de teste expirou. Continue por apenas R$ 9,90/ano.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <Badge variant="secondary" className="mb-2">Pagamento único</Badge>
            <div className="flex items-end justify-center gap-1">
              <span className="text-4xl font-bold">R$ 9,90</span>
              <span className="text-muted-foreground mb-1 text-sm">/ano</span>
            </div>
          </div>

          <ul className="space-y-2">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm">
                <Check className="size-4 shrink-0 text-primary" />
                {b}
              </li>
            ))}
          </ul>

          <Button className="w-full h-11" onClick={handlePay} disabled={paying}>
            {paying ? (
              <><Loader2 className="size-4 animate-spin" /> Redirecionando...</>
            ) : (
              <><Shield className="size-4" /> Pagar com Mercado Pago</>
            )}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Pagamento seguro via Mercado Pago · Pix, cartão ou boleto
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
