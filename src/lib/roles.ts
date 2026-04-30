export const ROLES = [
  {
    id: 'organizer',
    name: 'Organizer',
    rank9: 'Greeter',
    description: 'Natural leaders who build communities and structure servers. They thrive on welcoming members and establishing order.',
    textColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    buttonBorder: 'border-amber-500',
    hoverBg: 'hover:bg-amber-500/20'
  },
  {
    id: 'chatter',
    name: 'Chatter',
    rank9: 'Echo',
    description: 'The lifeblood of any active channel. They are always typing, keeping conversations alive and engaging with everyone.',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    buttonBorder: 'border-blue-400',
    hoverBg: 'hover:bg-blue-500/20'
  },
  {
    id: 'phantom',
    name: 'Phantom',
    rank9: 'Ghost',
    description: 'Watchers from the shadows. They observe everything, read every message, but rarely leave a trace of their presence.',
    textColor: 'text-slate-400',
    bgColor: 'bg-slate-400/10',
    borderColor: 'border-slate-400/30',
    buttonBorder: 'border-slate-400',
    hoverBg: 'hover:bg-slate-400/20'
  },
  {
    id: 'collector',
    name: 'Collector',
    rank9: 'Decorator',
    description: 'Aesthetes obsessed with their profile drip. They collect badges, colors, and constantly customize their digital identity.',
    textColor: 'text-fuchsia-500',
    bgColor: 'bg-fuchsia-500/10',
    borderColor: 'border-fuchsia-500/30',
    buttonBorder: 'border-fuchsia-500',
    hoverBg: 'hover:bg-fuchsia-500/20'
  },
  {
    id: 'whale',
    name: 'Whale',
    rank9: 'Minnow',
    description: 'The patrons of the server economy. They spend points, gift items, and flex their premium status.',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    buttonBorder: 'border-emerald-400',
    hoverBg: 'hover:bg-emerald-500/20'
  },
  {
    id: 'dev',
    name: 'Dev',
    rank9: 'Tester',
    description: 'Architects of the platform. They use advanced markdown, slash commands, and push the system to its technical limits.',
    textColor: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    buttonBorder: 'border-rose-500',
    hoverBg: 'hover:bg-rose-500/20'
  }
];

export type Role = typeof ROLES[number];

export function getRole(id: string): Role | undefined {
  return ROLES.find(p => p.id === id);
}

export function getRankName(roleId: string | null | undefined, rank: number | null | undefined): string {
  if (!roleId) return 'Guest';
  if (rank === 9) {
    const role = getRole(roleId);
    return role ? role.rank9 : 'Unknown Role';
  }
  return `Rank ${rank || '?'}`;
}
