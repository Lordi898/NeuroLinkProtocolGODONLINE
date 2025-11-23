
import { GlitchText } from '../GlitchText';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { PlayerList, type Player } from '../PlayerList';
import { TerminalCard } from '../TerminalCard';
import { NeonButton } from '../NeonButton';
import { Chat } from '../Chat';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { type ChatMessage } from '@/lib/gameState';
import { useLanguage } from '@/lib/languageContext';

interface LobbyScreenProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
  playOnHost: boolean;
  onPlayOnHostChange: (value: boolean) => void;
  chatMessages: ChatMessage[];
  onSendChatMessage: (text: string) => void;
  localPlayerId: string;
  votingFrequency: number;
  onVotingFrequencyChange: (frequency: number) => void;
  onKickPlayer: (playerId: string) => void;
}

export function LobbyScreen({
  roomCode,
  players,
  isHost,
  onStartGame,
  playOnHost,
  onPlayOnHostChange,
  chatMessages,
  onSendChatMessage,
  localPlayerId,
  votingFrequency,
  onVotingFrequencyChange,
  onKickPlayer
}: LobbyScreenProps) {
  const { language, setLanguage, theme, setTheme, styleMode, setStyleMode, t } = useLanguage();

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center gap-8">
      <GlitchText className="text-4xl md:text-6xl text-center">
        {t('neuroLink')}
      </GlitchText>
      <p className="text-secondary text-sm">{t('protocolZero')}</p>

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

      <div className="w-full max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-4">
          <QRCodeDisplay value={`NEURO-LINK://JOIN/${roomCode}`} size={200} />
          
          {isHost && (
            <TerminalCard title={t('hostSettings')}>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="play-on-host" className="text-sm">
                    {t('playOnThisDevice')}
                  </Label>
                  <Switch
                    id="play-on-host"
                    checked={playOnHost}
                    onCheckedChange={onPlayOnHostChange}
                    data-testid="switch-play-on-host"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="voting-freq" className="text-sm">
                    {t('votingFrequency')}
                  </Label>
                  <Select value={(votingFrequency || 1).toString()} onValueChange={(val) => onVotingFrequencyChange(parseInt(val))}>
                    <SelectTrigger id="voting-freq" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t('everyRound')}</SelectItem>
                      <SelectItem value="2">{t('every2Rounds')}</SelectItem>
                      <SelectItem value="3">{t('every3Rounds')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TerminalCard>
          )}
        </div>

        <TerminalCard title={t('connectedUsers')}>
          <div className="space-y-3">
            {players.map((player) => (
              <div key={player.id} className="flex items-center justify-between gap-2 p-3 rounded-md border border-border bg-card/30">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm">
                    {player.name}
                    {player.isHost && <span className="text-xs ml-2 px-2 py-0.5 bg-secondary/20 text-secondary rounded">HOST</span>}
                  </p>
                </div>
                {isHost && player.id !== localPlayerId && (
                  <button
                    onClick={() => onKickPlayer(player.id)}
                    className="p-1 hover-elevate active-elevate-2 text-destructive"
                    data-testid={`button-kick-${player.id}`}
                    title="Kick player"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {players.length} / 30 {t('playersCount')}
          </div>
        </TerminalCard>

        <div className="md:col-span-2 lg:col-span-1">
          <Chat
            messages={chatMessages}
            onSendMessage={onSendChatMessage}
            localPlayerId={localPlayerId}
            className="min-h-[300px]"
          />
        </div>
      </div>

      {isHost && players.length >= 3 && (
        <NeonButton 
          size="lg"
          onClick={onStartGame}
          data-testid="button-start-game"
          className="min-w-[200px]"
        >
          {t('initiateProtocol')}
        </NeonButton>
      )}

      {isHost && players.length < 3 && (
        <p className="text-muted-foreground text-sm">
          {t('minimumPlayers')}
        </p>
      )}
    </div>
  );
}
