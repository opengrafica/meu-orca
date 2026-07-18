import { Moon, Sun, User, Shield } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()

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
            <CardTitle className="flex items-center gap-2 text-base">
              {theme === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
              Aparência
            </CardTitle>
            <CardDescription>Configure o tema do aplicativo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Modo Escuro</Label>
                <p className="text-muted-foreground text-sm">Alterne entre tema claro e escuro</p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => {
                  if (checked !== (theme === 'dark')) toggleTheme()
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4" />
              Sobre o MeuOrça
            </CardTitle>
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
