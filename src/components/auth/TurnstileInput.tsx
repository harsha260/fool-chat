'use client'

import { Turnstile } from '@marsidev/react-turnstile'

export default function TurnstileInput() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (!siteKey) return null

  return (
    <div className="my-4 flex justify-center w-full">
      <Turnstile
        siteKey={siteKey}
        options={{ theme: 'dark', size: 'flexible' }}
      />
    </div>
  )
}
