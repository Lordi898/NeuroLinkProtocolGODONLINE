import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { NeonButton } from '@/components/NeonButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlitchText } from '@/components/GlitchText';
import { useLanguage } from '@/lib/languageContext';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { login, signup } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('MISSING CREDENTIALS');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await signup(username, password);
      }
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AUTH FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center gap-8 scanline">
      <div className="text-center space-y-2 md:space-y-4">
        <GlitchText className="text-5xl md:text-7xl">
          NEURO-LINK
        </GlitchText>
        <p className="text-secondary text-xs md:text-lg">
          {mode === 'login' ? 'AUTHENTICATE' : 'CREATE ACCOUNT'}
        </p>
      </div>

      <div className="w-full max-w-xs space-y-4 border-2 border-primary rounded-lg p-6 bg-background/50">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-xs font-mono">USERNAME</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="ENTER USERNAME"
            className="uppercase font-mono"
            disabled={loading}
            data-testid="input-username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-mono">PASSWORD</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="ENTER PASSWORD"
            className="uppercase font-mono"
            disabled={loading}
            data-testid="input-password"
          />
        </div>

        {error && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded px-2 py-1 font-mono text-center">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <NeonButton
            onClick={handleSubmit}
            disabled={loading || !username || !password}
            className="flex-1"
            data-testid="button-auth-submit"
          >
            {mode === 'login' ? 'LOGIN' : 'SIGNUP'}
          </NeonButton>
          <NeonButton
            variant="outline"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            disabled={loading}
            className="flex-1"
            data-testid="button-auth-toggle"
          >
            {mode === 'login' ? 'NEW USER' : 'HAVE ACCOUNT'}
          </NeonButton>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center max-w-md">
        {mode === 'login'
          ? 'SYNCHRONIZE ACROSS DEVICES. YOUR PROGRESS IS SECURE IN THE NETWORK.'
          : 'CREATE NEW IDENTITY TO ENTER THE NETWORK.'}
      </p>
    </div>
  );
}
