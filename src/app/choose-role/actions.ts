'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function selectRole(formData: FormData) {
  const roleId = formData.get('roleId') as string
  if (!roleId) throw new Error('Role is required')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ role: roleId, rank: 9 })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating role:', error)
    throw new Error('Failed to select role')
  }

  revalidatePath('/')
  redirect('/')
}
