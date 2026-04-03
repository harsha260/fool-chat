'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CreateOrganizationModal({ 
  open, 
  onOpenChange, 
  onSubmit 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onSubmit(name)
    setLoading(false)
    setName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Form a new secret gathering or organization in the Digital Sea.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="org-name" className="text-zinc-300">Organization Name</Label>
            <Input 
              id="org-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. The Tarot Club"
              className="bg-zinc-900 border-zinc-700 text-zinc-100"
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading ? "Creating..." : "Create Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CreateChannelModal({ 
  open, 
  onOpenChange, 
  onSubmit 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onSubmit(name)
    setLoading(false)
    setName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Create Gathering Channel</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Add a new space for members to discuss specific topics.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="channel-name" className="text-zinc-300">Channel Name</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">#</span>
              <Input 
                id="channel-name" 
                value={name} 
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                placeholder="formulas-exchange"
                className="bg-zinc-900 border-zinc-700 text-zinc-100 pl-8"
                autoFocus
                required
              />
            </div>
            <p className="text-xs text-zinc-500">Must be lowercase with hyphens instead of spaces.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function JoinOrganizationModal({ 
  open, 
  onOpenChange, 
  onSubmit 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string) => Promise<void>;
}) {
  const [id, setId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id.trim()) return
    setLoading(true)
    await onSubmit(id)
    setLoading(false)
    setId('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Join Organization</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enter an invite ID to join an existing organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="org-id" className="text-zinc-300">Invite ID</Label>
            <Input 
              id="org-id" 
              value={id} 
              onChange={(e) => setId(e.target.value)} 
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              className="bg-zinc-900 border-zinc-700 text-zinc-100"
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !id.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading ? "Joining..." : "Join Organization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function StartDMModal({ 
  open, 
  onOpenChange, 
  onSubmit 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSubmit: (codeName: string) => Promise<void>;
}) {
  const [codeName, setCodeName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codeName.trim()) return
    setLoading(true)
    await onSubmit(codeName)
    setLoading(false)
    setCodeName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Start Direct Message</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Reach out directly to another Beyonder using their Code Name.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="dm-codename" className="text-zinc-300">User&apos;s Code Name</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">@</span>
              <Input 
                id="dm-codename" 
                value={codeName} 
                onChange={(e) => setCodeName(e.target.value)} 
                placeholder="The_Fool"
                className="bg-zinc-900 border-zinc-700 text-zinc-100 pl-8"
                autoFocus
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !codeName.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading ? "Searching..." : "Start Chat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
