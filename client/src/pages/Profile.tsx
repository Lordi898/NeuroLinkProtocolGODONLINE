import { useState } from 'react';
import { useProgression } from '@/lib/progressionContext';
import { AVATARS, getAvatarsByTier } from '@/lib/avatars';
import { useLanguage } from '@/lib/languageContext';
import { NeonButton } from '@/components/NeonButton';
import { TerminalCard } from '@/components/TerminalCard';
import { Lock, Star, Trophy } from 'lucide-react';

interface ProfileProps {
  onBack: () => void;
}

export function Profile({ onBack }: ProfileProps) {
  const { profile, setCurrentAvatar, isUnlocked } = useProgression();
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<'avatars' | 'themes'>('avatars');

  const xpToNextLevel = Math.ceil((profile.rankLevel * 1000) - profile.xp);

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center gap-4 scanline">
      <TerminalCard title="PROFILE" className="w-full max-w-2xl">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">LEVEL</p>
            <p className="text-2xl font-bold text-primary">{profile.rankLevel}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">XP</p>
            <p className="text-2xl font-bold text-secondary">{profile.xp}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">WINS</p>
            <p className="text-2xl font-bold text-accent">{profile.totalWins}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">STREAK</p>
            <p className="text-2xl font-bold text-destructive">{profile.winStreak}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-2">
            <span>TO NEXT LEVEL</span>
            <span>{xpToNextLevel} XP</span>
          </div>
          <div className="w-full h-2 bg-card border border-border">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((profile.xp % 1000) / 1000) * 100}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedTab('avatars')}
            className={`text-xs px-4 py-2 border ${selectedTab === 'avatars' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground'}`}
            data-testid="tab-avatars"
          >
            AVATARS
          </button>
          <button
            onClick={() => setSelectedTab('themes')}
            className={`text-xs px-4 py-2 border ${selectedTab === 'themes' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-foreground'}`}
            data-testid="tab-themes"
          >
            THEMES
          </button>
        </div>

        {/* Avatars Grid */}
        {selectedTab === 'avatars' && (
          <div className="grid grid-cols-5 gap-2 mb-4 max-h-96 overflow-y-auto">
            {AVATARS.map(avatar => {
              const unlocked = isUnlocked(avatar.id);
              const isSelected = profile.currentAvatar === avatar.id;
              return (
                <button
                  key={avatar.id}
                  onClick={() => unlocked && setCurrentAvatar(avatar.id)}
                  disabled={!unlocked}
                  className={`p-3 border-2 text-center transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : unlocked
                        ? 'border-border hover:border-primary'
                        : 'border-muted opacity-50 cursor-not-allowed'
                  }`}
                  data-testid={`avatar-${avatar.id}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    {unlocked ? (
                      <>
                        <Star size={16} className={`${avatar.color}`} />
                        <p className="text-[10px] leading-none">{avatar.name}</p>
                      </>
                    ) : (
                      <>
                        <Lock size={16} className="text-muted-foreground" />
                        <p className="text-[10px] leading-none text-muted-foreground">LV {avatar.unlockLevel}</p>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Themes Grid */}
        {selectedTab === 'themes' && (
          <div className="grid grid-cols-3 gap-4">
            {['hacker', 'futurista', 'retro', 'matrix-retro', 'obsidian-lux', 'quantum-divinity'].map(themeId => {
              const unlocked = profile.unlockedThemes.includes(themeId);
              const conditions: Record<string, string> = {
                'matrix-retro': 'Win Streak 3+',
                'obsidian-lux': 'Win as Impostor',
                'quantum-divinity': 'Impostor Streak 3+',
              };
              return (
                <div
                  key={themeId}
                  className={`p-4 border text-center ${unlocked ? 'border-primary bg-primary/10' : 'border-muted opacity-50'}`}
                  data-testid={`theme-${themeId}`}
                >
                  <p className="text-xs font-bold uppercase mb-2">{themeId}</p>
                  {!unlocked && conditions[themeId] && (
                    <p className="text-[10px] text-muted-foreground">{conditions[themeId]}</p>
                  )}
                  {unlocked && <Trophy size={16} className="mx-auto text-secondary" />}
                </div>
              );
            })}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6 flex justify-center">
          <NeonButton onClick={onBack} variant="outline" data-testid="button-back-profile">
            BACK
          </NeonButton>
        </div>
      </TerminalCard>
    </div>
  );
}
