import { useEffect, useState } from 'react';
import { GlitchText } from '../GlitchText';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/languageContext';

interface RoleRevealScreenProps {
  isImpostor: boolean;
  secretWord?: string;
  category?: string;
  onRevealComplete: () => void;
}

export function RoleRevealScreen({
  isImpostor,
  secretWord,
  category,
  onRevealComplete
}: RoleRevealScreenProps) {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setRevealed(true), 200);
          setTimeout(onRevealComplete, 3000);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onRevealComplete]);

  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-8 transition-all duration-500",
        isImpostor && revealed && "bg-destructive"
      )}
    >
      {!revealed ? (
        <div className="w-full max-w-md space-y-8">
          <GlitchText className="text-2xl text-center block">
            {t('decrypting')}
          </GlitchText>
          <Progress value={progress} className="h-4 glow-pulse" />
          <p className="text-center text-sm text-muted-foreground">
            {progress.toFixed(0)}%
          </p>
        </div>
      ) : (
        <div className="text-center space-y-8 animate-in fade-in duration-500">
          {isImpostor ? (
            <>
              <GlitchText animate className="text-5xl md:text-7xl block text-destructive-foreground">
                {t('error')}
              </GlitchText>
              <p className="text-2xl md:text-4xl text-destructive-foreground">
                {t('signalLost')}
              </p>
              <p className="text-lg text-destructive-foreground/80">
                {t('youAreImpostor')}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{t('yourWordIs')}</p>
              <GlitchText className="text-5xl md:text-7xl block">
                {secretWord}
              </GlitchText>
              <p className="text-xl text-secondary">
                [{category}]
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                {t('describeWord')}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
