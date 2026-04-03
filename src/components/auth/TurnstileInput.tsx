'use client'

import { Turnstile } from '@marsidev/react-turnstile'

export default function TurnstileInput() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (!siteKey) {
    return (
      <div className="my-4 p-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded text-center w-full">
        <strong>Setup Required:</strong> Add <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> to your Vercel Environment Variables.
      </div>
    )
  }

  return (
    <div className="my-4 flex justify-center w-full">
      <Turnstile
        siteKey={siteKey}
        options={{ theme: 'dark', size: 'flexible' }}
      />
    </div>
  )
}
