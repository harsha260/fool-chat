'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function selectPathway(formData: FormData) {
  const pathwayId = formData.get('pathwayId') as string
  if (!pathwayId) throw new Error('Pathway is required')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ pathway: pathwayId, sequence: 9 })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating pathway:', error)
    throw new Error('Failed to select pathway')
  }

  revalidatePath('/')
  redirect('/')
}
