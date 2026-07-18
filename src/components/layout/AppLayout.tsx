import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FilePlus,
  History,
  Building2,
  Settings,
  Menu,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useTheme } from '@/contexts/ThemeContext'
import { signOut } from '@/services/authService'
import { toast } from 'sonner'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/quotes/new', label: 'Novo Orçamento', icon: FilePlus },
  { to: '/history', label: 'Histórico', icon: History },
  { to: '/profile', label: 'Perfil', icon: Building2 },
  { to: '/settings', label: 'Configurações', icon: Settings },
]

function NavLink({ to, label, icon: Icon, onClick }: {
  to: string
  label: string
  icon: typeof LayoutDashboard
  onClick?: () => void
}) {
  const location = useLocation()
  const isActive = location.pathname === to ||
    (to !== '/' && location.pathname.startsWith(to))

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logout realizado com sucesso')
      navigate('/login')
    } catch {
      toast.error('Erro ao sair')
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-5">
        <Link to="/" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            MO
          </div>
          <span className="text-lg font-bold">MeuOrça</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink key={item.to} {...item} onClick={onNavigate} />
        ))}
      </nav>

      <div className="space-y-1 border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}

export function AppLayout() {
  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
        <SidebarContent />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center border-b px-4 md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Menu className="size-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <span className="ml-3 text-lg font-bold">MeuOrça</span>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
