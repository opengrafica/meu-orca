import { Link, Navigate } from 'react-router-dom'
import {
  FileText, Users, Smartphone, Zap, Shield, Check,
  ArrowRight, Star, Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'

const features = [
  { icon: Zap, title: 'Orçamento em 30 segundos', desc: 'Crie orçamentos profissionais direto do celular ou computador.' },
  { icon: Users, title: 'Gestão de clientes', desc: 'Cadastre, edite e pesquise todos os seus clientes em um só lugar.' },
  { icon: FileText, title: 'PDF personalizado', desc: 'Exporte com sua logo, cores e dados da empresa.' },
  { icon: Smartphone, title: '100% responsivo', desc: 'Funciona perfeitamente no celular, tablet e desktop.' },
  { icon: Download, title: 'Histórico completo', desc: 'Duplique, filtre e exporte orçamentos anteriores.' },
  { icon: Shield, title: 'Dados seguros', desc: 'Seus dados protegidos com criptografia e backup na nuvem.' },
]

const professions = [
  'Gráficas', 'Pedreiros', 'Eletricistas', 'Mecânicos', 'Marceneiros',
  'Pintores', 'Técnicos', 'Serralheiros', 'Pequenos empresários',
]

const plans = [
  'Orçamentos ilimitados',
  'Clientes ilimitados',
  'PDF com sua logo e cores',
  'Dashboard completo',
  'Histórico e duplicar orçamentos',
  'Suporte por e-mail',
  '7 dias grátis para testar',
]

export function LandingPage() {
  const { user, loading, isAdmin } = useAuth()
  const { active, loading: subLoading } = useSubscription()

  if (loading || (user && !isAdmin && subLoading)) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (user) {
    if (isAdmin) return <Navigate to="/admin" replace />
    if (active) return <Navigate to="/dashboard" replace />
    return <Navigate to="/checkout" replace />
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">MO</div>
            <span className="text-xl font-bold">MeuOrça</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground">Recursos</a>
            <a href="#preco" className="text-sm text-muted-foreground hover:text-foreground">Preço</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" render={<Link to="/login" />}>Entrar</Button>
            <Button render={<Link to="/register" />}>Começar grátis</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">Para autônomos e pequenas empresas</Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Orçamentos profissionais em{' '}
            <span className="text-primary">menos de 30 segundos</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
            O MeuOrça é o gerador de orçamentos online mais simples do Brasil.
            Crie, envie e exporte PDFs personalizados direto do celular.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-12 px-8 text-base" render={<Link to="/register" />}>
              Testar 7 dias grátis
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" render={<Link to="/login" />}>
              Já tenho conta
            </Button>
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            Depois apenas <strong className="text-foreground">R$ 9,90</strong> — pagamento único · 1 ano de acesso
          </p>
        </div>
      </section>

      {/* Professions */}
      <section className="border-y bg-muted/30 px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2">
          {professions.map((p) => (
            <Badge key={p} variant="outline" className="px-3 py-1">{p}</Badge>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">Tudo que você precisa</h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-center">
            Simples, moderno e feito para quem não tem tempo a perder.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="preco" className="bg-muted/30 px-4 py-20">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border-2 border-primary bg-card p-8 shadow-lg">
            <div className="text-center">
              <Badge className="mb-4">Mais popular</Badge>
              <h2 className="text-2xl font-bold">Pagamento Único</h2>
              <div className="mt-4 flex items-end justify-center gap-1">
                <span className="text-5xl font-bold">R$ 9,90</span>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">Pague uma vez · Acesso por 1 ano completo</p>
              <p className="text-muted-foreground mt-1 text-xs">Sem mensalidade · Sem renovação automática</p>
            </div>
            <ul className="mt-8 space-y-3">
              {plans.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <Check className="size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Button className="mt-8 w-full h-12 text-base" size="lg" render={<Link to="/register" />}>
              Começar agora — 7 dias grátis
            </Button>
            <p className="text-muted-foreground mt-3 text-center text-xs">
              Cancele quando quiser · Sem cartão no trial
            </p>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-4 py-16 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="size-5 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            Feito para profissionais que precisam de agilidade no dia a dia.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary px-4 py-16 text-primary-foreground">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Pronto para profissionalizar seus orçamentos?</h2>
          <p className="mt-3 opacity-90">Comece grátis por 7 dias. Sem compromisso.</p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-6 h-12 px-8"
            render={<Link to="/register" />}
          >
            Criar conta grátis
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 text-center">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} MeuOrça · Gerador de orçamentos online
        </p>
      </footer>
    </div>
  )
}
