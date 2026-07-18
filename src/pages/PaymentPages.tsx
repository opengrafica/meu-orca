import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PaymentSuccessPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CheckCircle className="mx-auto size-16 text-primary" />
          <CardTitle className="text-2xl">Pagamento confirmado!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Pagamento confirmado! Seu acesso ao MeuOrça está ativo por 1 ano. Obrigado!
          </p>
          <Button className="w-full" render={<Link to="/dashboard" />}>
            Acessar MeuOrça
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function PaymentErrorPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <XCircle className="mx-auto size-16 text-destructive" />
          <CardTitle className="text-2xl">Pagamento não concluído</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Algo deu errado. Tente novamente ou escolha outro método de pagamento.
          </p>
          <Button className="w-full" render={<Link to="/checkout" />}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function PaymentPendingPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Clock className="mx-auto size-16 text-primary" />
          <CardTitle className="text-2xl">Pagamento pendente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Seu pagamento está sendo processado. Você receberá acesso assim que for confirmado.
          </p>
          <Button className="w-full" render={<Link to="/dashboard" />}>
            Ir para o Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
