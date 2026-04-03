'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

export default function GuestLoginButton() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleGuestLogin = async () => {
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

    const { data, error } = await supabase.auth.signInAnonymously()
    
    if (error) {
      console.error(error)
      alert("Error: Please enable 'Anonymous Sign-ins' in your Supabase Dashboard (Authentication -> Providers -> Anonymous).")
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
    <Button 
      type="button"
      onClick={handleGuestLogin}
      disabled={loading}
      variant="ghost"
      className="w-full text-center py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors"
    >
      {loading ? "Entering Spirit World..." : "Skip Logging In"}
    </Button>
  )
}
