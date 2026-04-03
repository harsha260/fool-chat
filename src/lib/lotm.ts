export const PATHWAYS = [
  {
    id: 'organizer',
    name: 'Organizer',
    sequence9: 'Greeter',
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
    sequence9: 'Echo',
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
    sequence9: 'Ghost',
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
    sequence9: 'Decorator',
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
    sequence9: 'Minnow',
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
    sequence9: 'Tester',
    description: 'Architects of the platform. They use advanced markdown, slash commands, and push the system to its technical limits.',
    textColor: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    buttonBorder: 'border-rose-500',
    hoverBg: 'hover:bg-rose-500/20'
  }
];

export type Pathway = typeof PATHWAYS[number];

export function getPathway(id: string): Pathway | undefined {
  return PATHWAYS.find(p => p.id === id);
}

export function getSequenceName(pathwayId: string | null | undefined, sequence: number | null | undefined): string {
  if (!pathwayId) return 'Wandering Spirit';
  if (sequence === 9) {
    const pathway = getPathway(pathwayId);
    return pathway ? pathway.sequence9 : 'Unknown Potion';
  }
  return `Sequence ${sequence || '?'}`;
}
