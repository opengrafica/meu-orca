import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminRoute } from '@/components/AdminRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { PaymentSuccessPage, PaymentErrorPage, PaymentPendingPage } from '@/pages/PaymentPages'
import { DashboardPage } from '@/pages/DashboardPage'
import { ClientsPage } from '@/pages/ClientsPage'
import { QuoteFormPage } from '@/pages/QuoteFormPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminClientsPage } from '@/pages/admin/AdminClientsPage'
import { AdminQuotesPage } from '@/pages/admin/AdminQuotesPage'
import { Skeleton } from '@/components/ui/skeleton'
import { useSubscription } from '@/hooks/useSubscription'

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth()
  const { active, loading: subLoading } = useSubscription()

  if (loading || (user && !isAdmin && subLoading)) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  if (user) {
    if (isAdmin) return <Navigate to="/admin" replace />
    if (active) return <Navigate to="/dashboard" replace />
    return <Navigate to="/checkout" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/pagamento/sucesso" element={<PaymentSuccessPage />} />
            <Route path="/pagamento/erro" element={<PaymentErrorPage />} />
            <Route path="/pagamento/pendente" element={<PaymentPendingPage />} />

            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="admin" element={<AdminDashboardPage />} />
                <Route path="admin/users" element={<AdminUsersPage />} />
                <Route path="admin/clients" element={<AdminClientsPage />} />
                <Route path="admin/quotes" element={<AdminQuotesPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="quotes/new" element={<QuoteFormPage />} />
                <Route path="quotes/:id/edit" element={<QuoteFormPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
