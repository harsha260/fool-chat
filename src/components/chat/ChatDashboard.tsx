'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Hash, User, LogOut, Copy, LogIn, MessageSquare, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getPathway, getSequenceName } from '@/lib/lotm'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type Organization = { id: string; name: string; owner_id: string }
type Channel = { id: string; name: string; organization_id: string }
type Message = { id: string; content: string; profile_id: string; created_at: string; code_name?: string; pathway?: string | null; sequence?: number; status?: 'pending' | 'sent' | 'error' }
type Profile = { id: string; code_name: string; pathway: string | null; sequence: number }

export default function ChatDashboard({ user, profile }: { user: SupabaseUser | null, profile: Profile | null }) {
  const supabase = createClient()
  
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null)
  
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const sessionTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      sessionTokenRef.current = data.session?.access_token || null
    })
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      sessionTokenRef.current = session?.access_token || null
    })
    
    return () => { authListener.subscription.unsubscribe() }
  }, [supabase])
  useEffect(() => {
    async function loadOrgs() {
      // First, get organization IDs the user is a member of
      if (!user) return
      
      const { data: membershipData } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('profile_id', user.id)
      
      const memberOrgIds = membershipData?.map(m => m.organization_id) || []
      
      if (memberOrgIds.length === 0) return

      const { data } = await supabase
        .from('organizations')
        .select('*')
        .in('id', memberOrgIds)
        .order('created_at', { ascending: true })

      if (data) {
        // Map DM names to something readable by looking at members
        const processedOrgs = await Promise.all(data.map(async (org) => {
          if (org.name.startsWith('DM:')) {
            const uuids = org.name.replace('DM:', '').split('_')
            const otherUserId = uuids.find((id: string) => id !== user.id)
            if (otherUserId) {
              const { data: otherProfile } = await supabase.from('profiles').select('code_name').eq('id', otherUserId).single()
              return { ...org, name: `@${otherProfile?.code_name || 'Unknown'}` }
            }
            return { ...org, name: '@Unknown' }
          }
          return org
        }))

        setOrganizations(processedOrgs)
        setActiveOrg(prev => prev || processedOrgs[0])
      }
    }
    loadOrgs()

    if (!user) return

    const orgSub = supabase.channel(`public:org_members:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'organization_members' }, (payload) => {
        if (payload.new.profile_id === user.id) {
          loadOrgs()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(orgSub)
    }
  }, [user?.id])

    // 2. Fetch Channels when activeOrg changes
  useEffect(() => {
    if (!activeOrg) return
    async function loadChannels() {
      if (!activeOrg) return
      const { data } = await supabase
        .from('channels')
        .select('*')
        .eq('organization_id', activeOrg.id)
        .order('created_at', { ascending: true })
      
      if (data) {
        setChannels(data)
        if (data.length > 0) setActiveChannel(data[0])
        else setActiveChannel(null)
      }
    }
    loadChannels()

    const channelSub = supabase.channel(`public:channels:${activeOrg.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'channels', filter: `organization_id=eq.${activeOrg.id}` }, (payload) => {
        setChannels(prev => {
          if (prev.some(c => c.id === payload.new.id)) return prev
          return [...prev, payload.new as Channel]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channelSub)
    }
  }, [activeOrg])

  // 3. Fetch Messages when activeChannel changes
  useEffect(() => {
    if (!activeChannel) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([])
      return
    }

    async function loadMessages() {
      if (!activeChannel) return
      const { data } = await supabase
        .from('messages')
        .select('*, profiles(code_name, pathway, sequence)')
        .eq('channel_id', activeChannel.id)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data.map(m => ({
          ...m,
          code_name: m.profiles?.code_name || 'Unknown Beyonder',
          pathway: m.profiles?.pathway,
          sequence: m.profiles?.sequence
        })) as Message[])
      }
    }
    loadMessages()

    // 4. Subscribe to new messages
    const channel = supabase.channel(`public:messages:channel_id=eq.${activeChannel.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel.id}` }, async (payload) => {
        // First check if it's already there from optimistic UI
        let isOptimistic = false
        setMessages((prev) => {
          if (prev.some(m => m.id === payload.new.id)) isOptimistic = true
          return prev
        })
        
        if (isOptimistic) return

        // Fetch the profile for the new message to get the code_name, pathway, sequence
        const { data: profileData } = await supabase.from('profiles').select('code_name, pathway, sequence').eq('id', payload.new.profile_id).single()
        const msg = { 
          ...payload.new, 
          code_name: profileData?.code_name || 'Unknown Beyonder', 
          pathway: profileData?.pathway,
          sequence: profileData?.sequence,
          status: 'sent' 
        } as Message
        
        // Show notification if from someone else
        if (msg.profile_id !== user?.id && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          if (document.hidden || !document.hasFocus()) {
            new Notification(msg.code_name || "New Message", {
              body: msg.content,
              icon: '/icon.png'
            })
          }
        }
        
        setMessages((prev) => {
          if (prev.some(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeChannel])

  const createOrganization = async () => {
    if (!user) return alert("Must be logged in!")
    const name = prompt("Enter Organization Name (e.g. The Tarot Club):")
    if (!name) return

    const { data: org, error } = await supabase
      .from('organizations')
      .insert({ name, owner_id: user.id })
      .select()
      .single()
    
    if (error) {
      console.error(error)
      alert("Error creating organization: " + error.message)
      return
    }

    if (org) {
      // Add the creator as a member of the organization
      await supabase.from('organization_members').insert({ organization_id: org.id, profile_id: user.id })

      // Create a default #general channel
      await supabase.from('channels').insert({ name: 'general', organization_id: org.id })
      setOrganizations(prev => [...prev, org])
      setActiveOrg(org)
    }
  }

  const createChannel = async () => {
    if (!user || !activeOrg) return alert("Must select an organization first!")
    const name = prompt("Enter Channel Name (e.g. formulas-exchange):")
    if (!name) return

    const { data: channel, error } = await supabase
      .from('channels')
      .insert({ name: name.toLowerCase().replace(/\s+/g, '-'), organization_id: activeOrg.id })
      .select()
      .single()
    
    if (channel) {
      setChannels(prev => [...prev, channel])
      setActiveChannel(channel)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChannel || !user) return

    const msgContent = newMessage
    setNewMessage('') // optimistic clear

    const tempId = `temp-${Date.now()}`
    const optimisticMsg: Message = {
      id: tempId,
      content: msgContent,
      profile_id: user.id,
      created_at: new Date().toISOString(),
      code_name: profile?.code_name || user.email || 'Wandering Spirit',
      status: 'pending'
    }

    setMessages(prev => [...prev, optimisticMsg])

    const { data, error } = await supabase.from('messages').insert({
      channel_id: activeChannel.id,
      profile_id: user.id,
      content: msgContent
    }).select().single()

    if (error) {
      console.error(error)
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'error' } : m))
      alert("Error sending message: " + error.message)
    } else {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...data, code_name: optimisticMsg.code_name, status: 'sent' } : m))
    }
  }

  const joinOrganization = async () => {
    if (!user) return alert("Must be logged in!")
    const orgId = prompt("Enter Organization ID to join:")
    if (!orgId) return

    const { data: org, error: orgError } = await supabase.from('organizations').select('*').eq('id', orgId).single()
    if (!org) return alert("Organization not found.")

    const { error: joinError } = await supabase.from('organization_members').insert({ organization_id: org.id, profile_id: user.id })
    if (joinError && joinError.code !== '23505') { // Ignore unique violation if already joined
      return alert("Error joining organization: " + joinError.message)
    }

    setOrganizations(prev => {
      if (prev.find(o => o.id === org.id)) return prev
      return [...prev, org]
    })
    setActiveOrg(org)
  }

  const startDM = async () => {
    if (!user) return alert("Must be logged in!")
    const targetCodeName = prompt("Enter the Code Name of the Beyonder you wish to contact:")
    if (!targetCodeName) return

    // Look up user by code name
    const { data: targetProfile, error: profileError } = await supabase.from('profiles').select('*').eq('code_name', targetCodeName).single()
    
    if (!targetProfile) return alert("Beyonder not found.")
    if (targetProfile.id === user.id) return alert("You cannot DM yourself.")

    // Check if DM org already exists for these two
    // Simple way: Name is deterministic or just search orgs where both are members and name starts with DM
    const dmName1 = `DM:${user.id}_${targetProfile.id}`
    const dmName2 = `DM:${targetProfile.id}_${user.id}`
    
    const { data: existingOrgs } = await supabase.from('organizations')
      .select('*')
      .or(`name.eq."${dmName1}",name.eq."${dmName2}"`)
    
    let dmOrg = existingOrgs?.[0]

    if (!dmOrg) {
      // Create new DM Org
      const { data: newOrg, error: createError } = await supabase.from('organizations')
        .insert({ name: dmName1, owner_id: user.id })
        .select().single()
      
      if (newOrg) {
        dmOrg = newOrg
        const { error: membersError } = await supabase.from('organization_members').insert([
          { organization_id: dmOrg.id, profile_id: user.id },
          { organization_id: dmOrg.id, profile_id: targetProfile.id }
        ])
        
        if (membersError) {
          console.error("Members error:", membersError)
          alert("Error adding users to DM: " + membersError.message)
        }

        await supabase.from('channels').insert({ name: 'whispers', organization_id: dmOrg.id })
      }
    }

    if (dmOrg) {
      // Add to list if not present, but use target Code Name for display instead of UUIDs
      const displayOrg = { ...dmOrg, name: `@${targetProfile.code_name}` }
      setOrganizations(prev => {
        if (prev.find(o => o.id === dmOrg.id)) return prev
        return [...prev, displayOrg]
      })
      setActiveOrg(displayOrg)
    }
  }

  const handleLogout = async () => {
    if (user?.is_anonymous) {
      // Direct RPC call from client is fully reliable since it carries the session
      const { error } = await supabase.rpc('delete_current_user')
      if (error) console.error("Error deleting anonymous user:", error)
    }
    
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  // Handle anonymous users leaving the session via closing the tab
  useEffect(() => {
    const handleUnload = () => {
      if (user?.is_anonymous && sessionTokenRef.current) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        if (supabaseUrl && anonKey) {
          // Extremely reliable beacon to PostgREST directly
          fetch(`${supabaseUrl}/rest/v1/rpc/delete_current_user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionTokenRef.current}`,
              'apikey': anonKey
            },
            keepalive: true
          }).catch(() => {})
        }
      }
    }

    window.addEventListener('beforeunload', handleUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [user])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [])

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Organizations Sidebar */}
      <div className={`w-16 bg-zinc-900 border-r border-zinc-800 flex-col items-center py-4 space-y-4 z-30 absolute md:relative h-full transition-transform duration-300 flex ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {organizations.map(org => (
          <div 
            key={org.id}
            onClick={() => setActiveOrg(org)}
            className={`w-12 h-12 flex items-center justify-center font-bold text-lg cursor-pointer transition-all duration-200 ${
              activeOrg?.id === org.id 
                ? 'rounded-xl bg-indigo-600 text-white' 
                : 'rounded-3xl bg-zinc-800 hover:rounded-xl hover:bg-indigo-500 hover:text-white text-zinc-300'
            }`}
            title={org.name}
          >
            {org.name.substring(0, 2).toUpperCase()}
          </div>
        ))}
        
        <div className="w-8 h-[2px] bg-zinc-800 rounded-full" />
        
        <button 
          onClick={createOrganization}
          className="w-12 h-12 rounded-3xl bg-zinc-800 hover:rounded-xl hover:bg-emerald-600 transition-all duration-200 flex items-center justify-center cursor-pointer text-emerald-400 hover:text-white"
          title="Create Organization"
        >
          <Plus size={24} />
        </button>

        <button 
          onClick={joinOrganization}
          className="w-12 h-12 rounded-3xl bg-zinc-800 hover:rounded-xl hover:bg-indigo-600 transition-all duration-200 flex items-center justify-center cursor-pointer text-indigo-400 hover:text-white"
          title="Join Organization"
        >
          <LogIn size={20} />
        </button>

        <button 
          onClick={startDM}
          className="w-12 h-12 rounded-3xl bg-zinc-800 hover:rounded-xl hover:bg-zinc-600 transition-all duration-200 flex items-center justify-center cursor-pointer text-zinc-400 hover:text-white mt-auto mb-4"
          title="Start Direct Message"
        >
          <MessageSquare size={20} />
        </button>
      </div>

      {/* Channels Sidebar */}
      <div className={`bg-zinc-900 flex-col border-r border-zinc-800 transition-all duration-300 overflow-hidden z-30 absolute md:relative h-full flex ${sidebarOpen ? 'w-60 translate-x-16 md:translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 border-r-0'}`}>
        <div className="h-12 min-w-[15rem] border-b border-zinc-800 flex items-center px-4 shadow-sm justify-between group">
          <span className="truncate text-base font-semibold">{activeOrg?.name || "No Organization"}</span>
          {activeOrg && !activeOrg.name.startsWith('@') && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(activeOrg.id)
                alert("Organization ID copied to clipboard!")
              }}
              className="text-zinc-500 hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
              title="Copy Organization ID to invite others"
            >
              <Copy size={16} />
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-w-[15rem]">
          {activeOrg && (
            <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-4 mb-1">
              <span>Gatherings</span>
              <button onClick={createChannel} className="hover:text-zinc-100"><Plus size={14} /></button>
            </div>
          )}
          
          {channels.map(channel => (
            <div 
              key={channel.id}
              onClick={() => {
                setActiveChannel(channel)
                if (window.innerWidth < 768) setSidebarOpen(false)
              }}
              className={`px-2 py-1 rounded cursor-pointer flex items-center gap-2 ${
                activeChannel?.id === channel.id 
                  ? 'bg-zinc-800 text-zinc-100' 
                  : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100'
              }`}
            >
              <Hash size={16} className="text-zinc-500" />
              <span className="truncate">{channel.name}</span>
            </div>
          ))}
        </div>
        
        {/* User Info Area */}
        <div className="h-14 bg-zinc-950 flex items-center px-4 gap-3 border-t border-zinc-800 min-w-[15rem]">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="text-sm font-semibold truncate">{profile?.code_name || "Wandering Spirit"}</span>
            <span className="text-xs text-zinc-400 truncate">
              {user?.is_anonymous ? "Anonymous User" : (profile?.sequence ? `Seq ${profile.sequence}: ${getSequenceName(profile.pathway, profile.sequence)}` : "Sequence Name")}
            </span>
          </div>
          <button onClick={handleLogout} className="text-zinc-500 hover:text-rose-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-zinc-950 min-w-0 h-full w-full">
        <div className="h-12 border-b border-zinc-800 flex items-center px-4 shadow-sm font-semibold gap-3 flex-shrink-0">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Menu size={20} />
          </button>
          {activeChannel ? (
            <>
              <Hash size={20} className="text-zinc-500" />
              <span>{activeChannel.name}</span>
            </>
          ) : (
            <span className="text-zinc-500">Select or create a gathering</span>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!activeChannel && activeOrg && channels.length === 0 && (
            <div className="flex items-center justify-center h-full text-zinc-500 flex-col gap-2">
              <p>No gatherings in this organization yet.</p>
              <Button onClick={createChannel} variant="outline" className="border-zinc-700">Create the first one</Button>
            </div>
          )}
          
          {messages.map(msg => {
            const isOwn = msg.profile_id === user?.id;
            const pathwayDef = getPathway(msg.pathway || '');
            const pathwayColorClass = pathwayDef ? pathwayDef.textColor : 'text-zinc-400';
            const sequenceBadge = msg.pathway ? `[${getSequenceName(msg.pathway, msg.sequence)}]` : '';

            return (
              <div key={msg.id} className={`flex gap-4 w-full ${msg.status === 'pending' ? 'opacity-50' : ''} ${msg.status === 'error' ? 'text-red-400' : ''} ${isOwn ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm ${pathwayDef ? pathwayDef.bgColor : 'bg-zinc-800'} ${pathwayDef ? pathwayDef.textColor : 'text-zinc-200'}`}>
                  {msg.code_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div className={`flex items-baseline gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className="font-semibold text-indigo-400">{msg.code_name}</span>
                    {sequenceBadge && <span className={`text-[10px] font-bold tracking-wide uppercase ${pathwayColorClass}`}>{sequenceBadge}</span>}
                    <span className="text-xs text-zinc-500">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.status === 'pending' && <span className="text-xs text-zinc-500 italic px-1">sending...</span>}
                    {msg.status === 'error' && <span className="text-xs text-red-500 italic px-1">failed</span>}
                  </div>
                  <div className={`mt-1 px-4 py-2.5 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed ${isOwn ? 'bg-indigo-600 text-zinc-100 rounded-tr-sm' : 'bg-zinc-800 text-zinc-100 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Message Input */}
        {activeChannel && user && (
          <div className="p-4">
            <form onSubmit={sendMessage} className="bg-zinc-800 rounded-lg p-3 flex items-center gap-3">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder={`Message #${activeChannel.name}`} 
                className="bg-transparent border-none outline-none flex-1 text-zinc-100 placeholder:text-zinc-500"
              />
            </form>
          </div>
        )}
        {activeChannel && !user && (
          <div className="p-4 text-center text-zinc-500 text-sm bg-zinc-900 border-t border-zinc-800">
            You must log in to participate in the gathering.
          </div>
        )}
      </div>
    </div>
  )
}