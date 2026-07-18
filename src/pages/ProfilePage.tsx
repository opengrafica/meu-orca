import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, Trash2, Palette } from 'lucide-react'
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
  pdf_primary_color: z.string(),
  pdf_footer_text: z.string(),
  pdf_show_watermark: z.boolean(),
})

export function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pdf_primary_color: '#2563eb',
      pdf_footer_text: '',
      pdf_show_watermark: true,
    },
  })

  const pdfColor = watch('pdf_primary_color')

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
            pdf_primary_color: profile.pdf_primary_color ?? '#2563eb',
            pdf_footer_text: profile.pdf_footer_text ?? '',
            pdf_show_watermark: profile.pdf_show_watermark !== false,
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
        description="Dados e personalização do PDF dos seus orçamentos"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Logo e Identidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-20 rounded-lg">
                {logoUrl ? (
                  <AvatarImage src={logoUrl} alt="Logo" className="object-cover" />
                ) : (
                  <AvatarFallback className="rounded-lg text-lg">MO</AvatarFallback>
                )}
              </Avatar>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="size-4" />
                  Upload
                </Button>
                {logoUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleRemoveLogo}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>

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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="size-4" />
              Personalização do PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf_primary_color">Cor principal do PDF</Label>
              <div className="flex gap-3">
                <Input id="pdf_primary_color" type="color" className="h-10 w-16 cursor-pointer p-1" {...register('pdf_primary_color')} />
                <Input value={pdfColor} onChange={(e) => setValue('pdf_primary_color', e.target.value)} className="flex-1 font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdf_footer_text">Texto do rodapé</Label>
              <Input id="pdf_footer_text" placeholder="Ex: Open Gráfica — Orçamentos profissionais" {...register('pdf_footer_text')} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('pdf_show_watermark')} className="size-4 rounded" />
              Mostrar marca MeuOrça no rodapé
            </label>
            <div
              className="rounded-lg p-4 text-white text-sm"
              style={{ backgroundColor: pdfColor ?? '#2563eb' }}
            >
              Prévia da cor no PDF — cabeçalho e totais usarão esta cor
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Perfil'}
        </Button>
      </form>
    </div>
  )
}
