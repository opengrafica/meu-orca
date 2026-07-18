import { Link } from 'react-router-dom'
import { User } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/lib/formatters'

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const { active, expiresAt, daysLeft } = useSubscription()

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Personalize sua experiência"
      />

      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4" />
              Conta
            </CardTitle>
            <CardDescription>Informações da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-muted-foreground text-xs">E-mail</Label>
              <p className="text-sm font-medium">{user?.email ?? '—'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">ID do Usuário</Label>
              <p className="text-sm font-mono text-muted-foreground">{user?.id ?? '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assinatura</CardTitle>
            <CardDescription>Seu plano MeuOrça — R$ 9,90/ano</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <span className={`text-sm font-medium ${active ? 'text-primary' : 'text-destructive'}`}>
                {active ? 'Ativo' : 'Expirado'}
              </span>
            </div>
            {expiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Validade</span>
                <span className="text-sm">{formatDate(expiresAt.split('T')[0])} ({daysLeft} dias)</span>
              </div>
            )}
            {!active && (
              <Button className="w-full" render={<Link to="/checkout" />}>
                Renovar por R$ 9,90/ano
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aparência</CardTitle>
            <CardDescription>Configure o tema do aplicativo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Modo Escuro</p>
                <p className="text-muted-foreground text-sm">Alterne entre tema claro e escuro</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={theme === 'dark'}
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-input'}`}
              >
                <span
                  className={`pointer-events-none block size-5 rounded-full bg-background shadow-lg transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sobre o MeuOrça</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Gerador de orçamentos online para autônomos e pequenas empresas.</p>
            <Separator />
            <p>Versão 1.0.0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
