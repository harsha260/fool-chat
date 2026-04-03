'use client'

import { useState } from 'react'
import { MoreHorizontal, SmilePlus, Pencil, Trash2, Check, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getRole, getRankName } from '@/lib/roles'
import { createClient } from '@/utils/supabase/client'

const EMOJIS = ['👍', '👎', '❤️', '😂', '🎉', '👁️', '✨', '🔥']

type Message = { 
  id: string; 
  content: string; 
  profile_id: string; 
  created_at: string; 
  code_name?: string; 
  role?: string | null; 
  rank?: number; 
  status?: 'pending' | 'sent' | 'error';
  is_edited?: boolean;
  reactions?: Record<string, string[]>; // { '👍': ['uuid1', 'uuid2'] }
}

export function MessageItem({ msg, currentUserId }: { msg: Message, currentUserId?: string }) {
  const isOwn = msg.profile_id === currentUserId
  const roleDef = getRole(msg.role || '')
  const roleColorClass = roleDef ? roleDef.textColor : 'text-zinc-400'
  const rankBadge = msg.role ? `[${getRankName(msg.role, msg.rank)}]` : ''
  
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(msg.content)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === msg.content) {
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    const { error } = await supabase
      .from('messages')
      .update({ content: editContent, is_edited: true, updated_at: new Date().toISOString() })
      .eq('id', msg.id)
    
    if (error) console.error("Error updating message:", error)
    setIsSaving(false)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message?")) return
    const { error } = await supabase.from('messages').delete().eq('id', msg.id)
    if (error) console.error("Error deleting message:", error)
  }

  const toggleReaction = async (emoji: string) => {
    if (!currentUserId) return
    
    // Optimistically calculate new reactions
    const currentReactions = msg.reactions || {}
    const usersWhoReacted = currentReactions[emoji] || []
    
    let newUsers
    if (usersWhoReacted.includes(currentUserId)) {
      newUsers = usersWhoReacted.filter(id => id !== currentUserId)
    } else {
      newUsers = [...usersWhoReacted, currentUserId]
    }

    const newReactions = { ...currentReactions }
    if (newUsers.length === 0) {
      delete newReactions[emoji]
    } else {
      newReactions[emoji] = newUsers
    }

    // Since RLS is a bit simplified, we just update the whole JSONB
    const { error } = await supabase
      .from('messages')
      .update({ reactions: newReactions })
      .eq('id', msg.id)
      
    if (error) console.error("Error updating reaction:", error)
  }

  return (
    <div className={`flex gap-4 w-full group ${msg.status === 'pending' ? 'opacity-50' : ''} ${msg.status === 'error' ? 'text-red-400' : ''} ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm ${roleDef ? roleDef.bgColor : 'bg-zinc-800'} ${roleDef ? roleDef.textColor : 'text-zinc-200'}`}>
        {msg.code_name?.[0]?.toUpperCase() || '?'}
      </div>
      
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[85%] min-w-0`}>
        <div className={`flex items-baseline gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="font-semibold text-indigo-400">{msg.code_name}</span>
          {rankBadge && <span className={`text-[10px] font-bold tracking-wide uppercase ${roleColorClass}`}>{rankBadge}</span>}
          <span className="text-xs text-zinc-500">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {msg.is_edited && <span className="text-xs text-zinc-500 italic">(edited)</span>}
          {msg.status === 'pending' && <span className="text-xs text-zinc-500 italic px-1">sending...</span>}
          {msg.status === 'error' && <span className="text-xs text-red-500 italic px-1">failed</span>}
        </div>
        
        <div className={`relative flex items-center gap-2 mt-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn ? 'bg-indigo-600 text-zinc-100 rounded-tr-sm' : 'bg-zinc-800 text-zinc-100 rounded-tl-sm'}`}>
            {isEditing ? (
              <div className="flex flex-col gap-2 min-w-[200px]">
                <textarea 
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-zinc-100 p-2 rounded text-sm w-full outline-none resize-none min-h-[60px]"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleEdit();
                    } else if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditContent(msg.content);
                    }
                  }}
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setIsEditing(false); setEditContent(msg.content); }} className="text-zinc-400 hover:text-zinc-200">
                    <X size={16} />
                  </button>
                  <button onClick={handleEdit} disabled={isSaving} className="text-emerald-400 hover:text-emerald-300">
                    <Check size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words">{msg.content}</div>
            )}
          </div>

          {/* Action Menu - Only visible on hover and not while editing */}
          {!isEditing && msg.status === 'sent' && (
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${isOwn ? 'mr-2' : 'ml-2'}`}>
              {currentUserId && (
                <Popover>
                  <PopoverTrigger className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-full transition-colors">
                    <SmilePlus size={16} />
                  </PopoverTrigger>
                  <PopoverContent side="top" align="center" className="w-auto p-2 bg-zinc-900 border-zinc-800">
                    <div className="flex gap-1">
                      {EMOJIS.map(emoji => (
                        <button 
                          key={emoji} 
                          onClick={() => toggleReaction(emoji)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded text-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {isOwn && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-full transition-colors">
                    <MoreHorizontal size={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align={isOwn ? "end" : "start"} className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    <DropdownMenuItem className="cursor-pointer focus:bg-zinc-800" onClick={() => setIsEditing(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Edit Message</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem className="cursor-pointer text-rose-500 focus:bg-rose-500/10 focus:text-rose-500" onClick={handleDelete}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>

        {/* Reactions Display */}
        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(msg.reactions).map(([emoji, users]) => {
              if (!users || users.length === 0) return null
              const hasReacted = currentUserId ? users.includes(currentUserId) : false
              return (
                <button 
                  key={emoji}
                  onClick={() => toggleReaction(emoji)}
                  className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full border ${hasReacted ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'bg-zinc-800/80 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800'}`}
                >
                  <span>{emoji}</span>
                  <span>{users.length}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
