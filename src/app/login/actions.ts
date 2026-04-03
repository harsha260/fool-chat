import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  'use server'

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const captchaToken = formData.get('cf-turnstile-response') as string | null
  const supabase = await createClient()

  const options = captchaToken ? { captchaToken } : undefined
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options
  })

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  'use server'

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const code_name = formData.get('code_name') as string
  const captchaToken = formData.get('cf-turnstile-response') as string | null
  const supabase = await createClient()

  if (!code_name || code_name.trim() === '') {
    redirect(`/login?message=${encodeURIComponent("Code Name is required for Sign Up")}`)
  }

  // Check if code_name is taken
  const { data: existingProfile } = await supabase.from('profiles').select('id').ilike('code_name', code_name.trim()).single()
  if (existingProfile) {
    redirect(`/login?message=${encodeURIComponent("Code Name is already taken")}`)
  }

  const options = captchaToken ? { captchaToken } : undefined
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options
  })

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  if (data.user) {
    // The trigger created the profile, now we update it with the chosen code_name
    await supabase.from('profiles').update({ code_name }).eq('id', data.user.id)
  }

  redirect('/')
}
