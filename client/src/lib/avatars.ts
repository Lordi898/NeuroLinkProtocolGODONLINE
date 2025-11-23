export interface Avatar {
  id: string;
  name: string;
  tier: 'starter' | 'intermediate' | 'elite';
  icon: string;
  color: string;
  unlockLevel: number;
}

export const AVATARS: Avatar[] = [
  // Tier 1: Starter (10 avatars) - Default Unlocked
  { id: 'avatar-1', name: 'Cipher', tier: 'starter', icon: 'User', color: 'text-green-500', unlockLevel: 1 },
  { id: 'avatar-2', name: 'Ghost', tier: 'starter', icon: 'Ghost', color: 'text-blue-400', unlockLevel: 1 },
  { id: 'avatar-3', name: 'Phantom', tier: 'starter', icon: 'Zap', color: 'text-yellow-400', unlockLevel: 1 },
  { id: 'avatar-4', name: 'Wraith', tier: 'starter', icon: 'Wind', color: 'text-purple-400', unlockLevel: 1 },
  { id: 'avatar-5', name: 'Specter', tier: 'starter', icon: 'Eye', color: 'text-red-400', unlockLevel: 1 },
  { id: 'avatar-6', name: 'Shade', tier: 'starter', icon: 'Moon', color: 'text-gray-400', unlockLevel: 1 },
  { id: 'avatar-7', name: 'Nova', tier: 'starter', icon: 'Star', color: 'text-cyan-400', unlockLevel: 1 },
  { id: 'avatar-8', name: 'Void', tier: 'starter', icon: 'Square', color: 'text-indigo-400', unlockLevel: 1 },
  { id: 'avatar-9', name: 'Echo', tier: 'starter', icon: 'Radio', color: 'text-emerald-400', unlockLevel: 1 },
  { id: 'avatar-10', name: 'Nexus', tier: 'starter', icon: 'Network', color: 'text-pink-400', unlockLevel: 1 },

  // Tier 2: Intermediate (10 avatars) - Unlocked at Levels 2-5
  { id: 'avatar-11', name: 'Rogue', tier: 'intermediate', icon: 'Skull', color: 'text-red-500', unlockLevel: 2 },
  { id: 'avatar-12', name: 'Vortex', tier: 'intermediate', icon: 'Loader', color: 'text-blue-600', unlockLevel: 2 },
  { id: 'avatar-13', name: 'Prism', tier: 'intermediate', icon: 'Lightbulb', color: 'text-yellow-500', unlockLevel: 3 },
  { id: 'avatar-14', name: 'Nexis', tier: 'intermediate', icon: 'Wifi', color: 'text-purple-600', unlockLevel: 3 },
  { id: 'avatar-15', name: 'Pulse', tier: 'intermediate', icon: 'Heart', color: 'text-red-600', unlockLevel: 4 },
  { id: 'avatar-16', name: 'Forge', tier: 'intermediate', icon: 'Hammer', color: 'text-orange-500', unlockLevel: 4 },
  { id: 'avatar-17', name: 'Catalyst', tier: 'intermediate', icon: 'Zap', color: 'text-green-600', unlockLevel: 5 },
  { id: 'avatar-18', name: 'Mirage', tier: 'intermediate', icon: 'Eye', color: 'text-cyan-600', unlockLevel: 5 },
  { id: 'avatar-19', name: 'Sentinel', tier: 'intermediate', icon: 'Shield', color: 'text-blue-500', unlockLevel: 5 },
  { id: 'avatar-20', name: 'Eclipse', tier: 'intermediate', icon: 'Moon', color: 'text-purple-500', unlockLevel: 5 },

  // Tier 3: Elite (10 avatars) - Unlocked at Levels 6-10
  { id: 'avatar-21', name: 'Archon', tier: 'elite', icon: 'Crown', color: 'text-yellow-600', unlockLevel: 6 },
  { id: 'avatar-22', name: 'Celestial', tier: 'elite', icon: 'Star', color: 'text-cyan-500', unlockLevel: 6 },
  { id: 'avatar-23', name: 'Sovereign', tier: 'elite', icon: 'Infinity', color: 'text-purple-700', unlockLevel: 7 },
  { id: 'avatar-24', name: 'Ascendant', tier: 'elite', icon: 'TrendingUp', color: 'text-green-700', unlockLevel: 7 },
  { id: 'avatar-25', name: 'Transcend', tier: 'elite', icon: 'Zap', color: 'text-yellow-700', unlockLevel: 8 },
  { id: 'avatar-26', name: 'Titan', tier: 'elite', icon: 'Hammer', color: 'text-red-700', unlockLevel: 8 },
  { id: 'avatar-27', name: 'Phantom Prime', tier: 'elite', icon: 'Ghost', color: 'text-blue-700', unlockLevel: 9 },
  { id: 'avatar-28', name: 'Omega', tier: 'elite', icon: 'Target', color: 'text-purple-600', unlockLevel: 9 },
  { id: 'avatar-29', name: 'Eternal', tier: 'elite', icon: 'Infinity', color: 'text-pink-600', unlockLevel: 10 },
  { id: 'avatar-30', name: 'Singularity', tier: 'elite', icon: 'Circle', color: 'text-cyan-700', unlockLevel: 10 },
];

export function getAvatarById(id: string): Avatar | undefined {
  return AVATARS.find(a => a.id === id);
}

export function getAvatarsByTier(tier: 'starter' | 'intermediate' | 'elite'): Avatar[] {
  return AVATARS.filter(a => a.tier === tier);
}
