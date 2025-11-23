import { useState, useEffect, useRef } from 'react';
import { TerminalCard } from './TerminalCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type ChatMessage } from '@/lib/gameState';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/languageContext';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  localPlayerId: string;
  activePlayerId?: string;
  secretWord?: string;
  className?: string;
}

export function Chat({ messages, onSendMessage, localPlayerId, activePlayerId, secretWord, className }: ChatProps) {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollViewport) {
      scrollViewport.scrollTop = scrollViewport.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Validar que no contiene la palabra secreta
    if (secretWord) {
      const forbiddenWord = secretWord.toLowerCase();
      const messageLower = inputText.toLowerCase();
      if (messageLower.includes(forbiddenWord)) {
        setError('Cannot send the secret word!');
        setTimeout(() => setError(''), 3000);
        return;
      }
    }

    onSendMessage(inputText.toUpperCase());
    setInputText('');
    setError('');
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <TerminalCard 
      title={t('communications')} 
      className={cn("flex flex-col", className)}
      scanline={false}
    >
      <ScrollArea className="flex-1 h-[300px] pr-4" ref={scrollAreaRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              NO MESSAGES YET
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === localPlayerId;
              const isActivePlayer = message.senderId === activePlayerId;
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col gap-1 p-2 md:p-3 rounded border transition-all",
                    isActivePlayer && !isOwnMessage
                      ? "bg-secondary/20 border-secondary/50 shadow-[0_0_15px_rgba(0,255,255,0.3)]" 
                      : isOwnMessage 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-card/30 border-border/30"
                  )}
                  data-testid={`chat-message-${message.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-xs font-bold tracking-wider",
                      isActivePlayer && !isOwnMessage ? "text-secondary text-glow-cyan" :
                      isOwnMessage ? "text-primary" : "text-secondary"
                    )}>
                      {message.senderName}
                      {isActivePlayer && " 🎯"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm md:text-base break-words",
                    isActivePlayer && !isOwnMessage && "font-semibold"
                  )}>
                    {message.text}
                  </p>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4 pt-4 border-t border-primary/30">
        {error && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded px-2 py-1 animate-pulse">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setError('');
            }}
            placeholder="TYPE MESSAGE..."
            className="flex-1 font-mono text-sm md:text-base min-h-[44px]"
            maxLength={200}
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputText.trim()}
            className="border-2 border-primary shadow-[0_0_10px_rgba(0,255,0,0.5)] min-h-[44px] min-w-[44px] touch-manipulation"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </form>
    </TerminalCard>
  );
}
