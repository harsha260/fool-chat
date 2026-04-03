import { PATHWAYS } from '@/lib/lotm'
import { selectPathway } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ChoosePathwayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Prevent users from choosing a pathway again if they already have one
  const { data: profile } = await supabase.from('profiles').select('pathway').eq('id', user.id).single()
  if (profile?.pathway) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-3xl w-full text-center mb-16 mt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-zinc-50">
          Choose Your Role
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Select a role that best fits your natural messaging habits. Your choice will unlock specialized features, tailored cosmetics, and unique advantages within the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full pb-16">
        {PATHWAYS.map((pathway) => (
          <Card 
            key={pathway.id} 
            className="bg-zinc-900/40 border-zinc-800/60 flex flex-col hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-300 group shadow-lg shadow-black/20"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className={`text-xl font-bold tracking-tight ${pathway.textColor}`}>
                  {pathway.name}
                </CardTitle>
                <div className={`w-2 h-2 rounded-full ${pathway.bgColor.replace('/10', '')} shadow-[0_0_8px_rgba(0,0,0,0)] shadow-${pathway.textColor.replace('text-', '')}`} />
              </div>
              <CardDescription className="text-zinc-500 font-medium text-sm tracking-wide uppercase">
                Starting Rank: {pathway.sequence9}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 text-zinc-400 text-sm leading-relaxed">
              <p>{pathway.description}</p>
            </CardContent>
            <CardFooter className="pt-4 border-t border-zinc-800/30">
              <form action={selectPathway} className="w-full">
                <input type="hidden" name="pathwayId" value={pathway.id} />
                <Button 
                  type="submit" 
                  className="w-full bg-zinc-800 hover:bg-zinc-200 hover:text-zinc-950 text-zinc-300 border-none transition-all duration-300 font-semibold"
                  variant="outline"
                >
                  Select Role
                </Button>
              </form>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
