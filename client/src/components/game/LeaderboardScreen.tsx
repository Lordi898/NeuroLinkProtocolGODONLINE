import { useQuery } from '@tanstack/react-query';
import { NeonButton } from '@/components/NeonButton';
import { TerminalCard } from '@/components/TerminalCard';
import { useLanguage } from '@/lib/languageContext';

interface LeaderboardScreenProps {
  onBack: () => void;
}

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const { t } = useLanguage();

  const { data: wins, isLoading: winsLoading } = useQuery({
    queryKey: ['/api/leaderboard/wins'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/wins?limit=10');
      return res.json();
    },
  });

  const { data: impostor, isLoading: impostorLoading } = useQuery({
    queryKey: ['/api/leaderboard/impostor-wins'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/impostor-wins?limit=10');
      return res.json();
    },
  });

  return (
    <div className="min-h-screen p-4 flex flex-col gap-6 scanline">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-4xl font-bold text-primary font-mono">
          GLOBAL RANKINGS
        </h1>
        <NeonButton size="sm" variant="outline" onClick={onBack} data-testid="button-back">
          BACK
        </NeonButton>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Wins */}
        <TerminalCard title="TOP HACKERS">
          {winsLoading ? (
            <div className="text-center text-muted-foreground">LOADING...</div>
          ) : wins && wins.length > 0 ? (
            <div className="space-y-2">
              {wins.map((entry: any, idx: number) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between text-xs md:text-sm border-b border-primary/30 pb-1"
                  data-testid={`leaderboard-wins-${idx}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-secondary font-bold w-6">#{idx + 1}</span>
                    <span className="font-mono">{entry.username}</span>
                  </div>
                  <span className="text-primary font-bold">{entry.totalWins} W</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">NO DATA</div>
          )}
        </TerminalCard>

        {/* Top Impostor */}
        <TerminalCard title="TOP IMPOSTORS">
          {impostorLoading ? (
            <div className="text-center text-muted-foreground">LOADING...</div>
          ) : impostor && impostor.length > 0 ? (
            <div className="space-y-2">
              {impostor.map((entry: any, idx: number) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between text-xs md:text-sm border-b border-primary/30 pb-1"
                  data-testid={`leaderboard-impostor-${idx}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-secondary font-bold w-6">#{idx + 1}</span>
                    <span className="font-mono">{entry.username}</span>
                  </div>
                  <span className="text-primary font-bold">{entry.impostorWins} W</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">NO DATA</div>
          )}
        </TerminalCard>
      </div>
    </div>
  );
}
