import { TimerDisplay } from '../TimerDisplay';
import { PlayerList, type Player } from '../PlayerList';
import { TerminalCard } from '../TerminalCard';
import { NeonButton } from '../NeonButton';
import { GlitchText } from '../GlitchText';
import { Chat } from '../Chat';
import { type ChatMessage } from '@/lib/gameState';

interface GameplayScreenProps {
  players: Player[];
  activePlayerId: string;
  timeRemaining: number;
  isImpostor: boolean;
  isMyTurn: boolean;
  secretWord?: string;
  category?: string;
  onNoiseBomb?: () => void;
  onEndTurn: () => void;
  chatMessages: ChatMessage[];
  onSendChatMessage: (text: string) => void;
  localPlayerId: string;
}

export function GameplayScreen({
  players,
  activePlayerId,
  timeRemaining,
  isImpostor,
  isMyTurn,
  secretWord,
  category,
  onNoiseBomb,
  onEndTurn,
  chatMessages,
  onSendChatMessage,
  localPlayerId
}: GameplayScreenProps) {
  const activePlayer = players.find(p => p.id === activePlayerId);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6">
      <div className="text-center">
        <GlitchText className="text-3xl md:text-5xl block">
          PROTOCOL ACTIVE
        </GlitchText>
      </div>

      <TimerDisplay 
        timeRemaining={timeRemaining} 
        maxTime={60} 
        className="max-w-md mx-auto w-full"
      />

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto w-full">
        <TerminalCard title="ACTIVE PLAYER">
          <div className="text-center py-8">
            <p className="text-3xl font-bold text-primary text-glow-green">
              {activePlayer?.name || 'UNKNOWN'}
            </p>
            {isMyTurn && (
              <p className="text-sm text-secondary mt-2">
                YOUR TURN TO SPEAK
              </p>
            )}
          </div>
        </TerminalCard>

        <TerminalCard title={isImpostor ? "YOUR ROLE" : "SECRET WORD"}>
          <div className="text-center py-8">
            {isImpostor ? (
              <p className="text-3xl font-bold text-destructive text-glow-red">
                IMPOSTOR
              </p>
            ) : (
              <>
                <p className="text-3xl font-bold text-primary text-glow-green">
                  {secretWord}
                </p>
                <p className="text-sm text-secondary mt-2">
                  [{category}]
                </p>
              </>
            )}
          </div>
        </TerminalCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto w-full">
        <TerminalCard title="CONNECTED USERS" scanline={false}>
          <PlayerList players={players} activePlayerId={activePlayerId} />
        </TerminalCard>

        <Chat
          messages={chatMessages}
          onSendMessage={onSendChatMessage}
          localPlayerId={localPlayerId}
        />
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        {isImpostor && onNoiseBomb && (
          <NeonButton 
            neonColor="red"
            variant="destructive"
            onClick={onNoiseBomb}
            data-testid="button-noise-bomb"
          >
            NOISE BOMB
          </NeonButton>
        )}
        {isMyTurn && (
          <NeonButton 
            onClick={onEndTurn}
            data-testid="button-end-turn"
          >
            END TURN
          </NeonButton>
        )}
      </div>
    </div>
  );
}
