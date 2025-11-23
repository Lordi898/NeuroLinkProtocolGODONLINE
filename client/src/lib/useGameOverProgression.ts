import { useProgression } from './progressionContext';
import { useLanguage } from './languageContext';
import { useToast } from '@/hooks/use-toast';

export function useGameOverProgression() {
  const { profile, addWin, addLoss, unlockTheme } = useProgression();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleGameOver = (winner: 'hackers' | 'impostor', wasImpostor: boolean) => {
    if (winner === 'impostor' && wasImpostor) {
      // Player won as impostor
      addWin(true);

      // Check for theme unlocks
      if (profile.impostorWins === 0) {
        // First impostor win
        unlockTheme('obsidian-lux');
        toast({
          title: t('obsidianLuxUnlocked'),
          description: 'Elegance. Power. Victory.',
        });
      }

      if (profile.impostorWinStreak + 1 === 3) {
        // 3-impostor streak achieved
        unlockTheme('quantum-divinity');
        toast({
          title: t('quantumDivinityUnlocked'),
          description: 'Transcendence unlocked.',
        });
      }
    } else if (winner === 'hackers' && !wasImpostor) {
      // Player won as hacker
      addWin(false);

      if (profile.winStreak + 1 === 3) {
        // 3-win streak achieved
        unlockTheme('matrix-retro');
        toast({
          title: t('matrixRetroUnlocked'),
          description: 'Welcome to the Matrix.',
        });
      }
    } else {
      // Player lost
      addLoss();
    }
  };

  return { handleGameOver };
}
