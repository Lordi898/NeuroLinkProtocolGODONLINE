import { useState } from 'react';
import { PlayerAvatar } from '../PlayerAvatar';
import { TerminalCard } from '../TerminalCard';
import { GlitchText } from '../GlitchText';
import { Chat } from '../Chat';
import { type Player } from '../PlayerList';
import { type ChatMessage } from '@/lib/gameState';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/languageContext';

interface VotingScreenProps {
  players: Player[];
  onVote: (playerId: string) => void;
  votedPlayerId?: string;
  chatMessages?: ChatMessage[];
  onSendChatMessage?: (text: string) => void;
  localPlayerId?: string;
  timeRemaining?: number;
  showTimer?: boolean;
}

export function VotingScreen({ 
  players, 
  onVote, 
  votedPlayerId,
  chatMessages = [],
  onSendChatMessage,
  localPlayerId = '',
  timeRemaining,
  showTimer = false
}: VotingScreenProps) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(votedPlayerId || null);

  const handleVote = (playerId: string) => {
    if (selectedId) return;
    setSelectedId(playerId);
    onVote(playerId);
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 flex flex-col gap-${showTimer ? '6' : '8'}`}>
      <div className="text-center">
        <GlitchText className="text-4xl md:text-6xl block">
          {t('voteToEliminate')}
        </GlitchText>
        <p className="text-secondary mt-2">{t('selectSuspectedImpostor')}</p>
        {showTimer && timeRemaining !== undefined && (
          <p className="text-xl text-destructive mt-2 animate-pulse">{timeRemaining}s</p>
        )}
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TerminalCard title={t('players')}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {players.filter(p => !p.isEliminated).map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleVote(player.id)}
                  disabled={selectedId !== null && selectedId !== player.id}
                  className={cn(
                    "p-3 md:p-4 rounded-md border-2 transition-all hover-elevate active-elevate-2 touch-manipulation min-h-[120px] disabled:opacity-50",
                    selectedId === player.id
                      ? "border-destructive bg-destructive/20 glow-pulse"
                      : "border-border bg-card/30"
                  )}
                  data-testid={`button-vote-${player.id}`}
                >
                  <div className="flex flex-col items-center gap-2 md:gap-3">
                    <PlayerAvatar 
                      name={player.name} 
                      isImpostor={selectedId === player.id}
                      className="w-12 h-12 md:w-16 md:h-16"
                    />
                    <p className="text-xs md:text-sm font-semibold text-center break-words">
                      {player.name}
                    </p>
                    {selectedId === player.id && (
                      <span className="text-xs text-destructive font-bold">{t('voted')}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </TerminalCard>
        </div>

        {onSendChatMessage && (
          <Chat
            messages={chatMessages}
            onSendMessage={onSendChatMessage}
            localPlayerId={localPlayerId}
            className="lg:col-span-1"
          />
        )}
      </div>

      {selectedId && !onSendChatMessage && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t('waitingForPlayers')}
          </p>
        </div>
      )}
    </div>
  );
}
