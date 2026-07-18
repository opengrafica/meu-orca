import { supabase } from '@/lib/supabase'

export async function uploadLogo(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const ext = file.name.split('.').pop()
  const fileName = `${user.id}/logo.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('company-logos')
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('company-logos')
    .getPublicUrl(fileName)

  return data.publicUrl
}

export async function deleteLogo(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data: files } = await supabase.storage
    .from('company-logos')
    .list(user.id)

  if (files && files.length > 0) {
    const paths = files.map((f) => `${user.id}/${f.name}`)
    await supabase.storage.from('company-logos').remove(paths)
  }
}
