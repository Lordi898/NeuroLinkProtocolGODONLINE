import { GlitchText } from '../GlitchText';
import { TerminalCard } from '../TerminalCard';
import { PlayerAvatar } from '../PlayerAvatar';
import { type VotingResult } from '@/lib/gameState';

interface VotingResultsScreenProps {
  results: VotingResult[];
  hasEliminatedPlayer: boolean;
}

export function VotingResultsScreen({ results, hasEliminatedPlayer }: VotingResultsScreenProps) {
  if (results.length === 0) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center gap-8">
        <GlitchText className="text-4xl md:text-6xl text-center">
          NO VOTES CAST
        </GlitchText>
        <p className="text-secondary text-lg">MOVING TO NEXT ROUND...</p>
      </div>
    );
  }

  const topVoted = results[0];
  const isTie = results.filter(r => r.voteCount === topVoted.voteCount).length > 1;

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-4">
        <GlitchText className="text-4xl md:text-6xl block">
          VOTING RESULTS
        </GlitchText>
        {isTie && !hasEliminatedPlayer && (
          <p className="text-xl text-destructive">TIE - NO ONE ELIMINATED</p>
        )}
        {hasEliminatedPlayer && !isTie && (
          <p className="text-xl text-primary text-glow-green">{topVoted.playerName} ELIMINATED</p>
        )}
      </div>

      <div className="w-full max-w-2xl space-y-4">
        {results.map((result) => (
          <TerminalCard key={result.playerId} title={result.playerName}>
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-primary text-glow-green">
                  {result.voteCount} VOTE{result.voteCount !== 1 ? 'S' : ''}
                </p>
              </div>

              {result.voters.length > 0 && (
                <div className="space-y-2 border-t border-border pt-4">
                  <p className="text-sm text-secondary font-semibold">VOTED BY:</p>
                  {result.voters.map((voter) => (
                    <div key={voter.voterId} className="flex items-center gap-2 p-2 bg-card/30 rounded">
                      <PlayerAvatar 
                        name={voter.voterName} 
                        className="w-8 h-8"
                      />
                      <p className="text-sm">{voter.voterName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TerminalCard>
        ))}
      </div>

      <p className="text-secondary text-sm mt-8 text-center">
        {hasEliminatedPlayer ? 'CONTINUING GAME...' : 'BACK TO GAMEPLAY...'}
      </p>
    </div>
  );
}
