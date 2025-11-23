import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
  xp: number;
  rankLevel: number;
  totalWins: number;
  winStreak: number;
  impostorWins: number;
  impostorWinStreak: number;
  unlockedAvatars: string[];
  unlockedThemes: string[];
  currentAvatar: string;
  currentTheme: string;
}

interface ProgressionContextType {
  profile: UserProfile;
  addXp: (amount: number) => void;
  addWin: (asImpostor: boolean) => void;
  addLoss: () => void;
  unlockAvatar: (avatarId: string) => void;
  unlockTheme: (themeId: string) => void;
  setCurrentAvatar: (avatarId: string) => void;
  setCurrentTheme: (themeId: string) => void;
  isUnlocked: (avatarId: string) => boolean;
  isThemeUnlocked: (themeId: string) => boolean;
  activateAdminMode: () => void;
}

const defaultProfile: UserProfile = {
  xp: 0,
  rankLevel: 1,
  totalWins: 0,
  winStreak: 0,
  impostorWins: 0,
  impostorWinStreak: 0,
  unlockedAvatars: ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5', 'avatar-6', 'avatar-7', 'avatar-8', 'avatar-9', 'avatar-10'],
  unlockedThemes: ['hacker', 'futurista', 'retro'],
  currentAvatar: 'avatar-1',
  currentTheme: 'hacker',
};

const XP_PER_LEVEL = 1000;
const XP_WIN = 100;
const XP_PLAY = 50;

const ProgressionContext = createContext<ProgressionContextType | undefined>(undefined);

export function ProgressionProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('neurospy_profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  useEffect(() => {
    localStorage.setItem('neurospy_profile', JSON.stringify(profile));
  }, [profile]);

  const calculateRankFromXp = (xp: number): number => {
    return Math.min(10, Math.floor(xp / XP_PER_LEVEL) + 1);
  };

  const addXp = (amount: number) => {
    setProfile(prev => {
      const newXp = prev.xp + amount;
      const newRank = calculateRankFromXp(newXp);
      const newProfile = { ...prev, xp: newXp, rankLevel: newRank };

      // Unlock avatars based on rank
      const avatarsByRank: Record<number, string[]> = {
        2: ['avatar-11', 'avatar-12', 'avatar-13', 'avatar-14', 'avatar-15'],
        3: ['avatar-16', 'avatar-17', 'avatar-18', 'avatar-19', 'avatar-20'],
        4: ['avatar-21', 'avatar-22', 'avatar-23', 'avatar-24', 'avatar-25'],
        5: ['avatar-26', 'avatar-27', 'avatar-28', 'avatar-29', 'avatar-30'],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
      };

      if (avatarsByRank[newRank]) {
        newProfile.unlockedAvatars = Array.from(new Set([...newProfile.unlockedAvatars, ...avatarsByRank[newRank]]));
      }

      return newProfile;
    });
  };

  const addWin = (asImpostor: boolean) => {
    setProfile(prev => {
      const newProfile = { ...prev, totalWins: prev.totalWins + 1, winStreak: prev.winStreak + 1 };
      
      if (asImpostor) {
        newProfile.impostorWins += 1;
        newProfile.impostorWinStreak = prev.impostorWinStreak + 1;
      }

      // Unlock themes based on achievements
      if (newProfile.winStreak === 3 && !prev.unlockedThemes.includes('matrix-retro')) {
        newProfile.unlockedThemes = [...newProfile.unlockedThemes, 'matrix-retro'];
      }
      if (newProfile.impostorWins === 1 && !prev.unlockedThemes.includes('obsidian-lux')) {
        newProfile.unlockedThemes = [...newProfile.unlockedThemes, 'obsidian-lux'];
      }
      if (newProfile.impostorWinStreak === 3 && !prev.unlockedThemes.includes('quantum-divinity')) {
        newProfile.unlockedThemes = [...newProfile.unlockedThemes, 'quantum-divinity'];
      }

      return newProfile;
    });

    // Add XP for winning
    addXp(XP_WIN);
  };

  const addLoss = () => {
    setProfile(prev => ({
      ...prev,
      winStreak: 0,
      impostorWinStreak: 0,
    }));

    // Add XP for playing
    addXp(XP_PLAY);
  };

  const unlockAvatar = (avatarId: string) => {
    setProfile(prev => ({
      ...prev,
      unlockedAvatars: Array.from(new Set([...prev.unlockedAvatars, avatarId])),
    }));
  };

  const unlockTheme = (themeId: string) => {
    setProfile(prev => ({
      ...prev,
      unlockedThemes: Array.from(new Set([...prev.unlockedThemes, themeId])),
    }));
  };

  const setCurrentAvatar = (avatarId: string) => {
    if (profile.unlockedAvatars.includes(avatarId)) {
      setProfile(prev => ({ ...prev, currentAvatar: avatarId }));
    }
  };

  const setCurrentTheme = (themeId: string) => {
    if (profile.unlockedThemes.includes(themeId)) {
      setProfile(prev => ({ ...prev, currentTheme: themeId }));
    }
  };

  const isUnlocked = (avatarId: string): boolean => {
    return profile.unlockedAvatars.includes(avatarId);
  };

  const isThemeUnlocked = (themeId: string): boolean => {
    return profile.unlockedThemes.includes(themeId);
  };

  const activateAdminMode = () => {
    const allAvatarIds = [
      'avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5',
      'avatar-6', 'avatar-7', 'avatar-8', 'avatar-9', 'avatar-10',
      'avatar-11', 'avatar-12', 'avatar-13', 'avatar-14', 'avatar-15',
      'avatar-16', 'avatar-17', 'avatar-18', 'avatar-19', 'avatar-20',
      'avatar-21', 'avatar-22', 'avatar-23', 'avatar-24', 'avatar-25',
      'avatar-26', 'avatar-27', 'avatar-28', 'avatar-29', 'avatar-30'
    ];

    const allThemes = ['hacker', 'futurista', 'retro', 'matrix-retro', 'obsidian-lux', 'quantum-divinity'];

    setProfile({
      ...profile,
      xp: 10000,
      rankLevel: 10,
      unlockedAvatars: allAvatarIds,
      unlockedThemes: allThemes,
    });
  };

  return (
    <ProgressionContext.Provider value={{ profile, addXp, addWin, addLoss, unlockAvatar, unlockTheme, setCurrentAvatar, setCurrentTheme, isUnlocked, isThemeUnlocked, activateAdminMode }}>
      {children}
    </ProgressionContext.Provider>
  );
}

export function useProgression() {
  const context = useContext(ProgressionContext);
  if (!context) {
    throw new Error('useProgression must be used within ProgressionProvider');
  }
  return context;
}
