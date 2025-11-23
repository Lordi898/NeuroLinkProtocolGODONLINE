import { useQuery } from '@tanstack/react-query';
import { NeonButton } from '@/components/NeonButton';
import { TerminalCard } from '@/components/TerminalCard';
import { useAuth } from '@/lib/authContext';
import { formatDistanceToNow } from 'date-fns';

interface MatchHistoryScreenProps {
  onBack: () => void;
}

export function MatchHistoryScreen({ onBack }: MatchHistoryScreenProps) {
  const { user } = useAuth();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['/api/users', user?.id, 'matches'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/matches?limit=20`);
      return res.json();
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen p-4 flex flex-col gap-6 scanline">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-4xl font-bold text-primary font-mono">
          MATCH HISTORY
        </h1>
        <NeonButton size="sm" variant="outline" onClick={onBack} data-testid="button-back">
          BACK
        </NeonButton>
      </div>

      <TerminalCard title="RECENT MATCHES">
        {isLoading ? (
          <div className="text-center text-muted-foreground">LOADING...</div>
        ) : matches && matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((match: any, idx: number) => (
              <div
                key={match.id}
                className="border-l-2 border-primary/50 pl-3 py-2 text-xs md:text-sm"
                data-testid={`match-history-${idx}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-secondary">
                    {match.secretWord}
                  </span>
                  <span className="text-primary">
                    {match.playerCount} players
                  </span>
                </div>
                <div className="text-muted-foreground mt-1">
                  Duration: {match.duration}s
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">NO MATCHES YET</div>
        )}
      </TerminalCard>
    </div>
  );
}
