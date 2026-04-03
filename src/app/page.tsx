import { createClient } from '@/utils/supabase/server'
import ChatDashboard from '@/components/chat/ChatDashboard'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data

    // If profile doesn't exist (because user signed up before tables were created), create it now
    if (!profile) {
      const newProfile = { 
        id: user.id, 
        code_name: user.email?.split('@')[0] || 'Unknown',
        rank: 9
      }
      await supabase.from('profiles').insert(newProfile)
      profile = newProfile
    }

    if (!user.is_anonymous && !profile.role) {
      redirect('/choose-role')
    }
  }

  return <ChatDashboard user={user} profile={profile} />
}
