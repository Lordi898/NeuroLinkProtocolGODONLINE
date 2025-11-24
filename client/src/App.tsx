import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { LanguageProvider } from "@/lib/languageContext";
import { ProgressionProvider, useProgression } from "@/lib/progressionContext";
import { JoinScreen } from "@/components/game/JoinScreen";
import { LobbyScreen } from "@/components/game/LobbyScreen";
import { RoleRevealScreen } from "@/components/game/RoleRevealScreen";
import { GameplayScreen } from "@/components/game/GameplayScreen";
import { ClueDisplayScreen } from "@/components/game/ClueDisplayScreen";
import { ObligatoryVotingScreen } from "@/components/game/ObligatoryVotingScreen";
import { VotingScreen } from "@/components/game/VotingScreen";
import { VotingResultsScreen } from "@/components/game/VotingResultsScreen";
import { GameOverScreen } from "@/components/game/GameOverScreen";
import { Profile } from "@/pages/Profile";
import { GameController } from "@/lib/gameController";
import { type GameState } from "@/lib/gameState";
import { type Player } from "@/components/PlayerList";

const gameController = new GameController();

function ThemeApplier() {
  const { profile } = useProgression();
  
  useEffect(() => {
    document.body.setAttribute('data-playable-theme', profile.currentTheme);
  }, [profile.currentTheme]);

  return null;
}

function App() {
  const [gameState, setGameState] = useState<GameState>(gameController.getState());
  const { toast } = useToast();

  useEffect(() => {
    gameController.onStateChange((state) => {
      setGameState(state);
    });

    return () => {
      gameController.disconnect();
    };
  }, []);

  const handleCreateRoom = async (playerName: string, adminMode: boolean = false) => {
    try {
      await gameController.createRoom(playerName);
      if (adminMode) {
        gameController.getState().adminMode = true;
        setGameState(prev => ({ ...prev, adminMode: true }));
      }
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

  const handleJoinRoom = async (playerName: string, roomCode: string, adminMode: boolean = false) => {
    try {
      await gameController.joinRoom(playerName, roomCode);
      if (adminMode) {
        gameController.getState().adminMode = true;
        setGameState(prev => ({ ...prev, adminMode: true }));
      }
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
    await gameController.startGame(gameState.playOnHost, 'en', gameState.adminMode);
  };

  const handleViewProfile = () => {
    setGameState(prev => ({ ...prev, phase: 'profile' }));
  };

  const handleBackFromProfile = () => {
    setGameState(prev => ({ ...prev, phase: 'join' }));
  };

  const handleEndTurn = () => {
    gameController.endTurn();
  };

  const handleSubmitClue = (clueText: string) => {
    gameController.submitClue(clueText);
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
    gameController.setPlayOnHost(value);
  };

  const handleSendChatMessage = (text: string) => {
    gameController.sendChatMessage(text);
  };

  const handleKickPlayer = (playerId: string) => {
    gameController.kickPlayer(playerId);
  };

  const handleSetVotingFrequency = (frequency: number) => {
    gameController.setVotingFrequency(frequency);
  };

  const handleLeaveGame = () => {
    gameController.leaveGame();
    setGameState(prev => ({ ...prev, phase: 'join' }));
  };

  const handleEndGame = () => {
    gameController.endGameAdmin();
    setGameState(prev => ({ ...prev, phase: 'join' }));
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
      <LanguageProvider>
        <ProgressionProvider>
          <TooltipProvider>
            <ThemeApplier />
            <div className="min-h-screen bg-background text-foreground">
              {gameState.phase === 'join' && (
                <JoinScreen
                  onCreateRoom={handleCreateRoom}
                  onJoinRoom={handleJoinRoom}
                  onProfile={handleViewProfile}
                />
              )}

              {gameState.phase === 'profile' && (
                <Profile onBack={handleBackFromProfile} />
              )}

              {gameState.phase === 'lobby' && (
                <LobbyScreen
                  roomCode={gameState.roomCode}
                  players={playersWithSignal}
                  isHost={isHost}
                  onStartGame={handleStartGame}
                  playOnHost={gameState.playOnHost}
                  onPlayOnHostChange={handlePlayOnHostChange}
                  chatMessages={gameState.chatMessages}
                  onSendChatMessage={handleSendChatMessage}
                  localPlayerId={gameState.localPlayerId}
                  votingFrequency={gameState.votingFrequency}
                  onVotingFrequencyChange={handleSetVotingFrequency}
                  onKickPlayer={handleKickPlayer}
                  onLeaveGame={handleLeaveGame}
                  onEndGame={gameState.adminMode ? handleEndGame : undefined}
                  adminMode={gameState.adminMode}
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
                  onSubmitClue={isMyTurn ? handleSubmitClue : undefined}
                  chatMessages={gameState.chatMessages}
                  onSendChatMessage={handleSendChatMessage}
                  localPlayerId={gameState.localPlayerId}
                />
              )}

              {gameState.phase === 'clue-display' && (
                <ClueDisplayScreen clue={gameState.currentClue} />
              )}

              {gameState.phase === 'voting' && gameState.votingTimeRemaining > 0 && (
                <ObligatoryVotingScreen
                  players={playersWithSignal}
                  onVote={handleCastVote}
                  votedPlayerId={localPlayer?.votedFor}
                  timeRemaining={gameState.votingTimeRemaining}
                  chatMessages={gameState.chatMessages}
                  onSendChatMessage={handleSendChatMessage}
                  localPlayerId={gameState.localPlayerId}
                />
              )}

              {gameState.phase === 'voting' && gameState.votingTimeRemaining <= 0 && (
                <VotingScreen
                  players={playersWithSignal}
                  onVote={handleCastVote}
                  votedPlayerId={localPlayer?.votedFor}
                />
              )}

              {gameState.phase === 'voting-results' && (
                <VotingResultsScreen 
                  results={gameState.votingResults}
                  hasEliminatedPlayer={gameState.votingResults.length > 0 && gameState.votingResults[0].voteCount > (gameState.votingResults.filter(r => r.voteCount === gameState.votingResults[0].voteCount).length === 1 ? 1 : 0)}
                />
              )}

              {gameState.phase === 'game-over' && impostorPlayer && (
                <GameOverScreen
                  winner={gameState.winner || 'hackers'}
                  impostorPlayer={impostorPlayer}
                  onPlayAgain={handlePlayAgain}
                  onBackToLobby={handleBackToLobby}
                  isImpostor={isImpostor}
                />
              )}
            </div>

            {gameState.adminMode && (
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
        </ProgressionProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;