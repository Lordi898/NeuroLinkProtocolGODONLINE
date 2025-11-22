import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { JoinScreen } from "@/components/game/JoinScreen";
import { LobbyScreen } from "@/components/game/LobbyScreen";
import { RoleRevealScreen } from "@/components/game/RoleRevealScreen";
import { GameplayScreen } from "@/components/game/GameplayScreen";
import { VotingScreen } from "@/components/game/VotingScreen";
import { GameOverScreen } from "@/components/game/GameOverScreen";
import { GameController } from "@/lib/gameController";
import { type GameState } from "@/lib/gameState";
import { type Player } from "@/components/PlayerList";

const gameController = new GameController();

function App() {
  const [gameState, setGameState] = useState<GameState>(gameController.getState());
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(config => {
        gameController.setApiKey(config.geminiApiKey);
      })
      .catch(err => console.error('Failed to fetch API key:', err));
    
    gameController.onStateChange((state) => {
      setGameState(state);
    });

    return () => {
      gameController.disconnect();
    };
  }, []);

  const handleCreateRoom = async (playerName: string) => {
    try {
      await gameController.createRoom(playerName);
      toast({
        title: "ROOM CREATED",
        description: `CODE: ${gameController.getState().roomCode}`,
      });
    } catch (error) {
      toast({
        title: "ERROR",
        description: "FAILED TO CREATE ROOM",
        variant: "destructive",
      });
    }
  };

  const handleJoinRoom = async (playerName: string, roomCode: string) => {
    try {
      await gameController.joinRoom(playerName, roomCode);
      toast({
        title: "CONNECTED",
        description: `JOINED ROOM: ${roomCode}`,
      });
    } catch (error) {
      toast({
        title: "ERROR",
        description: "FAILED TO JOIN ROOM",
        variant: "destructive",
      });
    }
  };

  const handleStartGame = async () => {
    await gameController.startGame(gameState.playOnHost);
  };

  const handleEndTurn = () => {
    gameController.endTurn();
  };

  const handleCastVote = (targetId: string) => {
    gameController.castVote(targetId);
  };

  const handleNoiseBomb = () => {
    gameController.noiseBomb();
  };

  const handlePlayAgain = () => {
    gameController.playAgain();
  };

  const handleBackToLobby = () => {
    gameController.backToLobby();
  };

  const handlePlayOnHostChange = (value: boolean) => {
    gameController.getState().playOnHost = value;
    setGameState({ ...gameController.getState(), playOnHost: value });
  };

  const localPlayer = gameState.players.find(p => p.id === gameState.localPlayerId);
  const isHost = gameState.localPlayerId === gameState.hostPlayerId;
  const isImpostor = localPlayer?.isImpostor || false;
  const isMyTurn = gameState.activePlayerId === gameState.localPlayerId;
  const impostorPlayer = gameState.players.find(p => p.id === gameState.impostorPlayerId);

  const playersWithSignal: Player[] = gameState.players.map(p => ({
    ...p,
    signalStrength: 100
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground">
          {gameState.phase === 'join' && (
            <JoinScreen
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
            />
          )}

          {gameState.phase === 'lobby' && (
            <LobbyScreen
              roomCode={gameState.roomCode}
              players={playersWithSignal}
              isHost={isHost}
              onStartGame={handleStartGame}
              playOnHost={gameState.playOnHost}
              onPlayOnHostChange={handlePlayOnHostChange}
            />
          )}

          {gameState.phase === 'role-reveal' && (
            <RoleRevealScreen
              isImpostor={isImpostor}
              secretWord={gameState.secretWord?.word}
              category={gameState.secretWord?.category}
              onRevealComplete={() => {}}
            />
          )}

          {gameState.phase === 'gameplay' && (
            <GameplayScreen
              players={playersWithSignal}
              activePlayerId={gameState.activePlayerId || ''}
              timeRemaining={gameState.turnTimeRemaining}
              isImpostor={isImpostor}
              isMyTurn={isMyTurn}
              secretWord={gameState.secretWord?.word}
              category={gameState.secretWord?.category}
              onNoiseBomb={isImpostor ? handleNoiseBomb : undefined}
              onEndTurn={handleEndTurn}
            />
          )}

          {gameState.phase === 'voting' && (
            <VotingScreen
              players={playersWithSignal}
              onVote={handleCastVote}
              votedPlayerId={localPlayer?.votedFor}
            />
          )}

          {gameState.phase === 'game-over' && impostorPlayer && (
            <GameOverScreen
              winner={gameState.winner || 'hackers'}
              impostorPlayer={impostorPlayer}
              onPlayAgain={handlePlayAgain}
              onBackToLobby={handleBackToLobby}
            />
          )}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50 flex gap-2 flex-wrap max-w-xs">
            <button
              onClick={() => gameController.getState().phase = 'join'}
              className="px-3 py-1 text-xs bg-primary/20 border border-primary rounded hover-elevate active-elevate-2"
              data-testid="debug-join"
            >
              JOIN
            </button>
            <button
              onClick={() => setGameState({ ...gameState, phase: 'lobby' })}
              className="px-3 py-1 text-xs bg-primary/20 border border-primary rounded hover-elevate active-elevate-2"
              data-testid="debug-lobby"
            >
              LOBBY
            </button>
            <button
              onClick={() => setGameState({ ...gameState, phase: 'role-reveal' })}
              className="px-3 py-1 text-xs bg-primary/20 border border-primary rounded hover-elevate active-elevate-2"
              data-testid="debug-reveal"
            >
              REVEAL
            </button>
            <button
              onClick={() => setGameState({ ...gameState, phase: 'gameplay' })}
              className="px-3 py-1 text-xs bg-primary/20 border border-primary rounded hover-elevate active-elevate-2"
              data-testid="debug-gameplay"
            >
              PLAY
            </button>
            <button
              onClick={() => setGameState({ ...gameState, phase: 'voting' })}
              className="px-3 py-1 text-xs bg-primary/20 border border-primary rounded hover-elevate active-elevate-2"
              data-testid="debug-voting"
            >
              VOTE
            </button>
            <button
              onClick={() => setGameState({ ...gameState, phase: 'game-over' })}
              className="px-3 py-1 text-xs bg-primary/20 border border-primary rounded hover-elevate active-elevate-2"
              data-testid="debug-gameover"
            >
              END
            </button>
          </div>
        )}

        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
