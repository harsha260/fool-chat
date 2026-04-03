import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  // Verify the user is authenticated and is anonymous
  const { data: { user } } = await supabase.auth.getUser()

  if (user && user.is_anonymous) {
    // Delete the user from auth.users using the RPC function
    await supabase.rpc('delete_current_user')
    // Sign out to clear the cookies
    await supabase.auth.signOut()
    
    return NextResponse.json({ message: 'Anonymous user deleted successfully' })
  }

  return NextResponse.json({ message: 'User is not anonymous or not logged in' }, { status: 400 })
}
