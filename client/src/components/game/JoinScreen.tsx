
import { useState } from 'react';
import { GlitchText } from '../GlitchText';
import { NeonButton } from '../NeonButton';
import { TerminalCard } from '../TerminalCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/lib/languageContext';
import { useProgression } from '@/lib/progressionContext';

interface JoinScreenProps {
  onCreateRoom: (playerName: string, adminMode?: boolean) => void;
  onJoinRoom: (playerName: string, roomCode: string, adminMode?: boolean) => void;
  onProfile?: () => void;
}

export function JoinScreen({ onCreateRoom, onJoinRoom, onProfile }: JoinScreenProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'admin'>('menu');
  const { language, setLanguage, theme, setTheme, styleMode, setStyleMode, t } = useLanguage();
  const { activateAdminMode } = useProgression();
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleAdminCode = () => {
    if (adminCode === 'LORDI') {
      setIsAdminMode(true);
      activateAdminMode();
      setMode('menu');
      setAdminCode('');
    }
  };

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      onCreateRoom(playerName.toUpperCase(), isAdminMode);
      setPlayerName('');
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && roomCode.trim()) {
      onJoinRoom(playerName.toUpperCase(), roomCode.toUpperCase(), isAdminMode);
      setPlayerName('');
      setRoomCode('');
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center gap-8 scanline">
      <div className="text-center space-y-2 md:space-y-4 flex flex-col items-center">
        <GlitchText className="text-5xl md:text-7xl block">
          {t('neuroLink')}
        </GlitchText>
        <p className="text-secondary text-xs md:text-lg leading-tight">{t('protocolZero')}</p>
        <p className="text-xs md:text-sm text-muted-foreground max-w-md leading-relaxed px-2">
          {t('gameDescription')}
        </p>
      </div>
      {/* Style, Theme and Language Selectors */}
      <div className="flex gap-4 flex-wrap justify-center">
        <div className="flex flex-col gap-2">
          <Label className="text-xs text-center">{t('styleMode')}</Label>
          <Select value={styleMode} onValueChange={(value) => setStyleMode(value as 'hacker' | 'futurista' | 'retro')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hacker">{t('styleModeHacker')}</SelectItem>
              <SelectItem value="futurista">{t('styleModeFuturista')}</SelectItem>
              <SelectItem value="retro">{t('styleModeRetro')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs text-center">{t('theme')}</Label>
          <Select value={theme} onValueChange={(value) => setTheme(value as 'dark' | 'normal' | 'light')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">{t('themeDark')}</SelectItem>
              <SelectItem value="normal">{t('themeNormal')}</SelectItem>
              <SelectItem value="light">{t('themeLight')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs text-center">{t('language')}</Label>
          <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'es')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">ENGLISH</SelectItem>
              <SelectItem value="es">ESPAÑOL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Admin Button - Centered Below Theme */}
      <div className="flex justify-center mt-2">
        <button
          onClick={() => setMode('admin')}
          data-testid="button-admin-mode"
          className="px-2 py-1 text-xs bg-primary/20 border border-primary rounded hover-elevate active-elevate-2"
          title="Admin Mode"
        >
          ⚙
        </button>
      </div>

      {mode === 'menu' && (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <NeonButton 
            size="lg"
            onClick={() => setMode('create')}
            data-testid="button-create-room"
            className="w-full"
          >
            {t('hostGame')}
          </NeonButton>
          <NeonButton 
            variant="outline"
            size="lg"
            onClick={() => setMode('join')}
            data-testid="button-join-room"
            className="w-full"
          >
            {t('joinGame')}
          </NeonButton>
          <NeonButton 
            variant="outline"
            size="lg"
            onClick={onProfile}
            data-testid="button-profile"
            className="w-full"
          >
            PROFILE
          </NeonButton>
        </div>
      )}
      {mode === 'admin' && (
        <TerminalCard title="ADMIN CODE" className="w-full max-w-md">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-code" className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[12px]">ENTER ADMIN CODE</Label>
              <Input
                id="admin-code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                placeholder="ADMIN CODE"
                className="uppercase"
                type="password"
                data-testid="input-admin-code"
              />
            </div>
            <div className="flex gap-2">
              <NeonButton 
                onClick={handleAdminCode}
                disabled={!adminCode.trim()}
                data-testid="button-confirm-admin"
                className="flex-1"
              >
                CONFIRM
              </NeonButton>
              <NeonButton 
                variant="outline"
                onClick={() => setMode('menu')}
                data-testid="button-back-admin"
              >
                {t('back')}
              </NeonButton>
            </div>
          </div>
        </TerminalCard>
      )}
      {mode === 'create' && (
        <TerminalCard title={t('hostNewGame')} className="w-full max-w-md">
          <div className="space-y-4">
            <div className="space-y-2 text-center">
              <Label htmlFor="player-name" className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[12px]">{t('playerName')}</Label>
              <Input
                id="player-name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={t('enterYourName')}
                className="uppercase"
                maxLength={20}
                data-testid="input-player-name"
              />
            </div>
            <div className="flex gap-2">
              <NeonButton 
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
                data-testid="button-confirm-create"
                className="flex-1"
              >
                {t('create')}
              </NeonButton>
              <NeonButton 
                variant="outline"
                onClick={() => setMode('menu')}
                data-testid="button-back"
              >
                {t('back')}
              </NeonButton>
            </div>
          </div>
        </TerminalCard>
      )}
      {mode === 'join' && (
        <TerminalCard title={t('joinExistingGame')} className="w-full max-w-md">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="player-name-join" className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[12px]">{t('playerName')}</Label>
              <Input
                id="player-name-join"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={t('enterYourName')}
                className="uppercase"
                maxLength={20}
                data-testid="input-player-name-join"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-code" className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[12px]">{t('roomCode')}</Label>
              <Input
                id="room-code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder={t('enterRoomCode')}
                className="uppercase"
                maxLength={10}
                data-testid="input-room-code"
              />
            </div>
            {isAdminMode && (
              <div className="p-2 border border-primary/50 bg-primary/10 text-xs text-primary">
                ADMIN MODE ACTIVE - You can bypass 3-player minimum
              </div>
            )}
            <div className="flex gap-2">
              <NeonButton 
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || !roomCode.trim()}
                data-testid="button-confirm-join"
                className="flex-1"
              >
                {t('join')}
              </NeonButton>
              <NeonButton 
                variant="outline"
                onClick={() => setMode('menu')}
                data-testid="button-back-join"
              >
                {t('back')}
              </NeonButton>
            </div>
          </div>
        </TerminalCard>
      )}
      {/* Creator Info Footer */}
      <div className="fixed bottom-4 text-center text-xs text-muted-foreground">
        <p>Created by <span className="font-bold text-secondary">Imanol Magaña</span></p>
        <a 
          href="https://github.com/Lordi898/ImpostorOnline_NeuroLinkProtocol.git"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline"
          data-testid="link-github"
        >
          GitHub Repository
        </a>
      </div>
    </div>
  );
}
