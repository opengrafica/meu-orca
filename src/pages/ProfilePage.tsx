import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getProfile, updateProfile, updateLogoUrl } from '@/services/profileService'
import { uploadLogo, deleteLogo } from '@/services/storageService'
import type { ProfileFormData } from '@/types'

const schema = z.object({
  company_name: z.string().min(1, 'Nome da empresa obrigatório'),
  phone: z.string(),
  email: z.string().email('E-mail inválido').or(z.literal('')),
  address: z.string(),
  city: z.string(),
  state: z.string(),
})

export function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    getProfile()
      .then((profile) => {
        if (profile) {
          reset({
            company_name: profile.company_name ?? '',
            phone: profile.phone ?? '',
            email: profile.email ?? '',
            address: profile.address ?? '',
            city: profile.city ?? '',
            state: profile.state ?? '',
          })
          setLogoUrl(profile.logo_url)
        }
      })
      .catch(() => toast.error('Erro ao carregar perfil'))
      .finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true)
    try {
      await updateProfile(data)
      toast.success('Perfil atualizado!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem')
      return
    }

    try {
      const url = await uploadLogo(file)
      await updateLogoUrl(url)
      setLogoUrl(url)
      toast.success('Logo atualizada!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro no upload')
    }
  }

  const handleRemoveLogo = async () => {
    try {
      await deleteLogo()
      await updateLogoUrl('')
      setLogoUrl(null)
      toast.success('Logo removida!')
    } catch {
      toast.error('Erro ao remover logo')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Perfil da Empresa"
        description="Dados que aparecem nos seus orçamentos e PDFs"
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Logo e Identidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <Avatar className="size-20 rounded-lg">
              {logoUrl ? (
                <AvatarImage src={logoUrl} alt="Logo" className="object-cover" />
              ) : (
                <AvatarFallback className="rounded-lg text-lg">MO</AvatarFallback>
              )}
            </Avatar>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload className="size-4" />
                Upload
              </Button>
              {logoUrl && (
                <Button variant="ghost" size="sm" onClick={handleRemoveLogo}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nome da Empresa *</Label>
              <Input id="company_name" {...register('company_name')} />
              {errors.company_name && <p className="text-destructive text-sm">{errors.company_name.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" {...register('address')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" {...register('state')} />
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
