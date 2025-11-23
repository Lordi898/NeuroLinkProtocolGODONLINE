import React from 'react';
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
  onSubmitClue?: (clue: string) => void;
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
  onSubmitClue,
  chatMessages,
  onSendChatMessage,
  localPlayerId
}: GameplayScreenProps) {
  const [clueText, setClueText] = React.useState('');
  const activePlayer = players.find(p => p.id === activePlayerId);

  return (
    <div className={`min-h-screen p-4 md:p-8 flex flex-col gap-4 md:gap-6 ${isMyTurn ? 'bg-primary/5' : ''}`}>
      <div className="text-center">
        <GlitchText className="text-3xl md:text-5xl block">
          PROTOCOL ACTIVE
        </GlitchText>
        {isMyTurn && (
          <div className="mt-2 animate-pulse">
            <p className="text-2xl md:text-3xl font-bold text-primary text-glow-green">
              ⚡ YOUR TURN ⚡
            </p>
            <p className="text-sm md:text-base text-secondary mt-1">
              GIVE YOUR CLUE NOW
            </p>
          </div>
        )}
      </div>

      <TimerDisplay 
        timeRemaining={timeRemaining} 
        maxTime={60} 
        className="max-w-md mx-auto w-full"
      />

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 max-w-4xl mx-auto w-full">
        <TerminalCard title="ACTIVE PLAYER">
          <div className="text-center py-4 md:py-8">
            <p className="text-2xl md:text-3xl font-bold text-primary text-glow-green">
              {activePlayer?.name || 'UNKNOWN'}
            </p>
          </div>
        </TerminalCard>

        <TerminalCard title={isImpostor ? "YOUR ROLE" : "SECRET WORD"}>
          <div className="text-center py-4 md:py-8">
            {isImpostor ? (
              <p className="text-2xl md:text-3xl font-bold text-destructive text-glow-red">
                IMPOSTOR
              </p>
            ) : (
              <>
                <p className="text-2xl md:text-3xl font-bold text-primary text-glow-green">
                  {secretWord}
                </p>
                <p className="text-xs md:text-sm text-secondary mt-2">
                  [{category}]
                </p>
              </>
            )}
          </div>
        </TerminalCard>
      </div>

      {/* Clue Input - Only for active player */}
      {isMyTurn && onSubmitClue && (
        <div className="max-w-md mx-auto w-full px-4">
          <TerminalCard title="SUBMIT CLUE (1-3 WORDS)">
            <div className="flex gap-2">
              <input
                type="text"
                value={clueText}
                onChange={(e) => setClueText(e.target.value.slice(0, 50))}
                placeholder="Enter clue..."
                maxLength={50}
                className="flex-1 px-3 py-2 rounded bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                data-testid="input-clue"
              />
              <NeonButton
                onClick={() => {
                  if (clueText.trim()) {
                    onSubmitClue(clueText);
                    setClueText('');
                  }
                }}
                disabled={!clueText.trim()}
                size="lg"
                className="touch-manipulation min-h-[48px]"
                data-testid="button-submit-clue"
              >
                SEND
              </NeonButton>
            </div>
          </TerminalCard>
        </div>
      )}

      {/* Botones de acción - Prioridad en móvil */}
      {(isImpostor && onNoiseBomb) && (
        <div className="flex gap-3 md:gap-4 justify-center flex-wrap max-w-md mx-auto w-full px-4">
          {isImpostor && onNoiseBomb && (
            <NeonButton 
              neonColor="red"
              variant="destructive"
              onClick={onNoiseBomb}
              data-testid="button-noise-bomb"
              size="lg"
              className="flex-1 min-w-[140px] touch-manipulation min-h-[48px]"
            >
              NOISE BOMB
            </NeonButton>
          )}
        </div>
      )}

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2 max-w-4xl mx-auto w-full">
        <TerminalCard title="CONNECTED USERS" scanline={false} className="order-2 lg:order-1">
          <PlayerList players={players} activePlayerId={activePlayerId} />
        </TerminalCard>

        <Chat
          messages={chatMessages}
          onSendMessage={(text) => {
            // Filtrar palabra secreta
            if (!isImpostor && secretWord) {
              const forbiddenWord = secretWord.toLowerCase();
              const messageLower = text.toLowerCase();
              if (messageLower.includes(forbiddenWord)) {
                return; // No enviar mensaje con palabra prohibida
              }
            }
            onSendChatMessage(text);
          }}
          localPlayerId={localPlayerId}
          activePlayerId={activePlayerId}
          secretWord={!isImpostor ? secretWord : undefined}
          className="order-1 lg:order-2"
        />
      </div>
    </div>
  );
}
