import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { signIn } from '@/services/authService'
import { supabase } from '@/lib/supabase'
import { isAdminUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await signIn(data.email, data.password)
      const { data: { user } } = await supabase.auth.getUser()
      toast.success('Login realizado com sucesso!')
      navigate(isAdminUser(user) ? '/admin' : '/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold">
            MO
          </div>
          <CardTitle className="text-2xl">MeuOrça</CardTitle>
          <CardDescription>Entre na sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" {...register('email')} />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••" {...register('password')} />
              {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 space-y-2 text-center text-sm">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Esqueceu a senha?
            </Link>
            <p className="text-muted-foreground">
              Não tem conta?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
