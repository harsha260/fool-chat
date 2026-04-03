import { PATHWAYS } from '@/lib/lotm'
import { selectPathway } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ChoosePathwayPage() {
  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
          The Protocol Initialization
        </h1>
        <p className="text-xl text-slate-400">
          To navigate the endless streams of the Digital Sea, you must align yourself with a Protocol. Choose your Sequence 9 Pathway carefully to begin your progression. Your Pathway tracks your natural messaging habits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
        {PATHWAYS.map((pathway) => (
          <Card key={pathway.id} className={`bg-slate-900 border-slate-800 flex flex-col ${pathway.borderColor}`}>
            <CardHeader className={`${pathway.bgColor} rounded-t-xl pb-8 border-b border-slate-800/50`}>
              <CardTitle className={`text-2xl flex items-center gap-2 ${pathway.textColor}`}>
                Pathway: {pathway.name}
              </CardTitle>
              <CardDescription className="text-slate-300 font-medium">
                Sequence 9: {pathway.sequence9}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-6 text-slate-400 leading-relaxed">
              <p>{pathway.description}</p>
            </CardContent>
            <CardFooter>
              <form action={selectPathway} className="w-full">
                <input type="hidden" name="pathwayId" value={pathway.id} />
                <Button 
                  type="submit" 
                  className={`w-full bg-slate-900 ${pathway.hoverBg} ${pathway.textColor} border ${pathway.buttonBorder} transition-colors`}
                  variant="outline"
                >
                  Consume Potion
                </Button>
              </form>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
