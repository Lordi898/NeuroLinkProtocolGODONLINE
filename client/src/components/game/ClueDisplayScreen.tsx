import { useEffect, useState } from 'react';
import { GlitchText } from '../GlitchText';
import { TerminalCard } from '../TerminalCard';
import { type Clue } from '@/lib/gameState';

interface ClueDisplayScreenProps {
  clue?: Clue;
}

export function ClueDisplayScreen({ clue }: ClueDisplayScreenProps) {
  const [displayTime, setDisplayTime] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!clue) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center gap-8">
      <GlitchText className="text-4xl md:text-6xl text-center">
        INCOMING CLUE
      </GlitchText>

      <TerminalCard title={clue.senderName} className="max-w-2xl">
        <div className="text-center py-12 md:py-16">
          <p className="text-3xl md:text-5xl font-bold text-primary text-glow-green mb-8">
            {clue.text}
          </p>
          <p className="text-2xl text-secondary animate-pulse">
            {displayTime}s
          </p>
        </div>
      </TerminalCard>
    </div>
  );
}
