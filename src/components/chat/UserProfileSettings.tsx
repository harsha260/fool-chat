'use client'

import { useState } from 'react'
import { User, LogOut, Settings, Hash, Shield, Bell, KeySquare, MonitorSpeaker, Eye, Palette } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { getRole, getRankName } from '@/lib/roles'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Profile = { id: string; code_name: string; role: string | null; rank: number }

export default function UserProfileSettings({ profile, isAnonymous, handleLogout }: { profile: Profile | null, isAnonymous: boolean, handleLogout: () => void }) {
  const router = useRouter()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [codeName, setCodeName] = useState(profile?.code_name || '')
  const [updatingName, setUpdatingName] = useState(false)

  // Mock preferences
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [enterToSend, setEnterToSend] = useState(true)
  const [showRankBadges, setShowRankBadges] = useState(true)

  const roleDef = getRole(profile?.role || '')
  const supabase = createClient()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || isAnonymous || !codeName.trim() || codeName === profile.code_name) return
    
    setUpdatingName(true)
    const { error } = await supabase.from('profiles').update({ code_name: codeName }).eq('id', profile.id)
    if (error) {
      alert("Error updating Code Name. It might be taken.")
      console.error(error)
    } else {
      alert("Code Name updated! Refresh to see changes globally.")
    }
    setUpdatingName(false)
  }

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all focus:outline-none" title="Profile & Settings">
          {profile?.code_name ? profile.code_name.substring(0, 2).toUpperCase() : <User size={20} />}
        </PopoverTrigger>
        <PopoverContent side="right" align="end" className="w-56 bg-zinc-900 border-zinc-800 text-zinc-300 ml-2 p-2">
          <div className="flex flex-col space-y-1 mb-2 px-2 py-1.5">
            <p className="text-sm font-medium leading-none text-zinc-100">{profile?.code_name || "Wandering Spirit"}</p>
            <p className="text-xs leading-none text-zinc-500 mt-1">
              {isAnonymous ? "Anonymous User" : (profile?.rank ? `Seq ${profile.rank}: ${getRankName(profile.role, profile.rank)}` : "Rank Name")}
            </p>
          </div>
          <div className="h-px bg-zinc-800 my-1" />
          
          <button 
            className="w-full flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-zinc-800 hover:text-zinc-100 rounded transition-colors" 
            onClick={() => { setPopoverOpen(false); setSettingsOpen(true) }}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Profile & Settings</span>
          </button>

          <div className="h-px bg-zinc-800 my-1" />
          
          <button 
            onClick={() => { setPopoverOpen(false); handleLogout() }} 
            className="w-full flex items-center px-2 py-1.5 text-sm cursor-pointer text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 rounded transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </button>
        </PopoverContent>
      </Popover>

      {settingsOpen && (
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden">
            <div className="flex h-[500px]">
            <Tabs defaultValue="profile" className="flex flex-col w-full h-full">
              <div className="flex flex-row h-full">
                {/* Sidebar Tabs */}
                <div className="w-[140px] bg-zinc-900/50 border-r border-zinc-800 p-2 flex flex-col gap-1">
                  <TabsList className="flex flex-col h-auto bg-transparent p-0 w-full space-y-1">
                    <TabsTrigger value="profile" className="w-full justify-start data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400">
                      <User className="w-4 h-4 mr-2" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="w-full justify-start data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400">
                      <Settings className="w-4 h-4 mr-2" /> Prefs
                    </TabsTrigger>
                    <TabsTrigger value="account" className="w-full justify-start data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400">
                      <Shield className="w-4 h-4 mr-2" /> Account
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <DialogHeader className="mb-4">
                    <DialogTitle>User Settings</DialogTitle>
                    <DialogDescription className="text-zinc-400 sr-only">
                      Manage your Digital Sea preferences.
                    </DialogDescription>
                  </DialogHeader>

                  {/* PROFILE TAB */}
                  <TabsContent value="profile" className="mt-0 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm ${roleDef ? roleDef.bgColor : 'bg-zinc-800'} ${roleDef ? roleDef.textColor : 'text-zinc-200'}`}>
                        {profile?.code_name ? profile.code_name.substring(0, 2).toUpperCase() : <User size={32} />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl">{profile?.code_name}</h3>
                        <p className={`text-sm ${roleDef?.textColor || 'text-zinc-400'}`}>
                          {profile?.role ? `${roleDef?.name} Role` : "Unassigned Role"}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {isAnonymous ? "Anonymous User" : (profile?.rank ? `Rank ${profile.rank} — ${getRankName(profile.role, profile.rank)}` : "Unranked")}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4 border-t border-zinc-800/50">
                      <div className="space-y-2">
                        <Label htmlFor="codeName" className="text-zinc-300">Code Name</Label>
                        <Input 
                          id="codeName"
                          value={codeName}
                          onChange={e => setCodeName(e.target.value)}
                          disabled={isAnonymous || updatingName}
                          className="bg-zinc-900 border-zinc-700 text-zinc-100"
                        />
                        {isAnonymous && <p className="text-xs text-zinc-500">Anonymous users cannot change their code name.</p>}
                      </div>
                      {!isAnonymous && (
                        <Button type="submit" disabled={updatingName || codeName === profile?.code_name} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                          {updatingName ? 'Updating...' : 'Save Changes'}
                        </Button>
                      )}
                    </form>
                  </TabsContent>

                  {/* PREFERENCES TAB */}
                  <TabsContent value="preferences" className="mt-0 space-y-6">
                    <h3 className="font-semibold text-lg border-b border-zinc-800 pb-2">App Preferences</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <MonitorSpeaker className="w-4 h-4 text-zinc-400" />
                            <Label className="text-zinc-200 text-base">Sound Notifications</Label>
                          </div>
                          <p className="text-xs text-zinc-500">Play a sound when a new message arrives.</p>
                        </div>
                        <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} className="data-[state=checked]:bg-indigo-600" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <KeySquare className="w-4 h-4 text-zinc-400" />
                            <Label className="text-zinc-200 text-base">Press Enter to Send</Label>
                          </div>
                          <p className="text-xs text-zinc-500">Send messages immediately with the Enter key.</p>
                        </div>
                        <Switch checked={enterToSend} onCheckedChange={setEnterToSend} className="data-[state=checked]:bg-indigo-600" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-zinc-400" />
                            <Label className="text-zinc-200 text-base">Show Rank Badges</Label>
                          </div>
                          <p className="text-xs text-zinc-500">Display role and rank badges next to names in chat.</p>
                        </div>
                        <Switch checked={showRankBadges} onCheckedChange={setShowRankBadges} className="data-[state=checked]:bg-indigo-600" />
                      </div>
                      
                      <div className="flex items-center justify-between opacity-50 cursor-not-allowed">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-zinc-400" />
                            <Label className="text-zinc-200 text-base">Light Theme</Label>
                          </div>
                          <p className="text-xs text-zinc-500">The Digital Sea is permanently dark.</p>
                        </div>
                        <Switch disabled checked={false} />
                      </div>
                    </div>
                  </TabsContent>

                  {/* ACCOUNT TAB */}
                  <TabsContent value="account" className="mt-0 space-y-6">
                    <h3 className="font-semibold text-lg border-b border-zinc-800 pb-2">Account Security</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                        <h4 className="font-medium text-zinc-200 mb-1">Account Type</h4>
                        <p className="text-sm text-zinc-400">{isAnonymous ? 'Guest (Anonymous)' : 'Standard Authenticated User'}</p>
                        {isAnonymous && (
                          <p className="text-xs text-rose-400 mt-2">
                            Warning: As an anonymous guest, your account will be permanently deleted upon logging out or closing the browser.
                          </p>
                        )}
                      </div>

                      <div className="bg-zinc-900 p-4 rounded-lg border border-red-900/30">
                        <h4 className="font-medium text-red-400 mb-1">Danger Zone</h4>
                        <p className="text-sm text-zinc-400 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                        <Button 
                          variant="destructive" 
                          className="bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-900/50"
                          onClick={() => {
                            if (confirm("Are you entirely sure you want to sever your connection to the Digital Sea?")) {
                              handleLogout() // For now, logout deletes anon users. For real users, we need an RPC to delete them.
                            }
                          }}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      )}
    </>
  )
}
