'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { Turnstile } from '@marsidev/react-turnstile'

export default function GuestLoginButton() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const handleGuestLogin = async () => {
    if (siteKey && !captchaToken) {
      alert("Please complete the CAPTCHA first to proceed anonymously.")
      return
    }

    const codeName = prompt("Enter your Code Name for this gathering:")
    if (!codeName || codeName.trim() === '') return

    setLoading(true)

    // Check if code name is already taken (case-insensitive)
    const { data: existing } = await supabase.from('profiles').select('id').ilike('code_name', codeName.trim()).single()
    if (existing) {
      alert("This Code Name is already taken by another Beyonder. Please choose a unique one.")
      setLoading(false)
      return
    }

    const options = captchaToken ? { captchaToken } : undefined
    const { data, error } = await supabase.auth.signInAnonymously({ options })
    
    if (error) {
      console.error(error)
      alert("Error: Please check your Supabase Dashboard configuration (Anonymous Sign-ins and CAPTCHA).")
      setLoading(false)
      return
    }

    if (data.user) {
      // The trigger created an empty profile. Now we update it.
      const { error: updateError } = await supabase.from('profiles').update({ 
        code_name: codeName.trim(),
        pathway: 'Anonymous',
        sequence: 0
      }).eq('id', data.user.id)

      if (updateError) {
        // If it failed because someone took it in the last millisecond
        alert("Failed to claim Code Name. It might have just been taken.")
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      window.location.href = '/'
    }
  }

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      {siteKey && (
        <Turnstile
          siteKey={siteKey}
          onSuccess={(token) => setCaptchaToken(token)}
          options={{ theme: 'dark', size: 'flexible' }}
        />
      )}
      <Button 
        type="button"
        onClick={handleGuestLogin}
        disabled={loading || (!!siteKey && !captchaToken)}
        variant="ghost"
        className="w-full text-center py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
      >
        {loading ? "Processing..." : "Skip Logging In"}
      </Button>
    </div>
  )
}
