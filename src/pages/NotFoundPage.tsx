import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4 text-center">
      <h1 className="text-8xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Página não encontrada</h2>
      <p className="text-muted-foreground mt-2 max-w-md">
        A página que você procura não existe ou foi movida.
      </p>
      <Button className="mt-6" render={<Link to="/" />}>
        <Home className="size-4" />
        Voltar ao Dashboard
      </Button>
    </div>
  )
}
