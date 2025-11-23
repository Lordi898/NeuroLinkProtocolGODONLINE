import { useEffect } from 'react';
import { GlitchText } from '../GlitchText';
import { NeonButton } from '../NeonButton';
import { TerminalCard } from '../TerminalCard';
import { PlayerAvatar } from '../PlayerAvatar';
import { type Player } from '../PlayerList';
import { cn } from '@/lib/utils';
import { useGameOverProgression } from '@/lib/useGameOverProgression';

interface GameOverScreenProps {
  winner: 'hackers' | 'impostor';
  impostorPlayer: Player;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  isImpostor?: boolean;
}

export function GameOverScreen({
  winner,
  impostorPlayer,
  onPlayAgain,
  onBackToLobby,
  isImpostor = false
}: GameOverScreenProps) {
  const { handleGameOver } = useGameOverProgression();

  useEffect(() => {
    // Award XP and check for theme unlocks when game ends
    handleGameOver(winner, isImpostor);
  }, [winner, isImpostor, handleGameOver]);
  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-6">
        <GlitchText 
          animate 
          className={cn(
            "text-5xl md:text-7xl block",
            winner === 'hackers' ? 'text-primary' : 'text-destructive'
          )}
        >
          {winner === 'hackers' ? 'HACKERS WIN' : 'IMPOSTOR WINS'}
        </GlitchText>
        
        <p className="text-xl text-muted-foreground">
          {winner === 'hackers' 
            ? 'THE IMPOSTOR HAS BEEN ELIMINATED' 
            : 'THE IMPOSTOR REMAINS UNDETECTED'}
        </p>
      </div>

      <TerminalCard title="IMPOSTOR REVEALED" className="max-w-md">
        <div className="flex flex-col items-center gap-4 py-6">
          <PlayerAvatar 
            name={impostorPlayer.name} 
            isImpostor 
            className="w-24 h-24"
          />
          <p className="text-2xl font-bold text-destructive">
            {impostorPlayer.name}
          </p>
        </div>
      </TerminalCard>

      <div className="flex gap-4 flex-wrap justify-center">
        <NeonButton 
          size="lg"
          onClick={onPlayAgain}
          data-testid="button-play-again"
        >
          PLAY AGAIN
        </NeonButton>
        <NeonButton 
          variant="outline"
          size="lg"
          onClick={onBackToLobby}
          data-testid="button-back-to-lobby"
        >
          BACK TO LOBBY
        </NeonButton>
      </div>
    </div>
  );
}
