import { login, signup } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import GuestLoginButton from '@/components/auth/GuestLoginButton'
import TurnstileInput from '@/components/auth/TurnstileInput'

export default async function LoginPage(props: {
  searchParams: Promise<{ message?: string }>
}) {
  const searchParams = await props.searchParams
  const message = searchParams.message

  return (
    <div className="flex h-screen w-full items-center justify-center px-4 bg-zinc-950 text-zinc-100">
      <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
        <form>
          <CardHeader className="space-y-1 text-center pb-8">
            <CardTitle className="text-3xl font-bold tracking-tight text-zinc-100">Login</CardTitle>
            <CardDescription className="text-zinc-400">
              Welcome back
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <div className="bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-300 p-3 rounded-md mb-4 text-center">
                {message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="ordinary.person@world.com" 
                required 
                className="bg-zinc-950 border-zinc-700 text-zinc-100 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="bg-zinc-950 border-zinc-700 text-zinc-100 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code_name" className="text-zinc-300">Code Name (Only required for Sign Up)</Label>
              <Input 
                id="code_name" 
                name="code_name" 
                type="text" 
                placeholder="The Fool" 
                className="bg-zinc-950 border-zinc-700 text-zinc-100 focus-visible:ring-indigo-500"
              />
            </div>
            <TurnstileInput key={message || 'default'} />
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 pb-6">
            <Button 
              type="submit"
              formAction={login} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0"
            >
              Login
            </Button>
            <Button 
              type="submit"
              formAction={signup} 
              variant="outline" 
              className="w-full border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Sign Up
            </Button>
            
            <div className="relative w-full py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-900 px-2 text-zinc-500">Or</span>
              </div>
            </div>

            <GuestLoginButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
