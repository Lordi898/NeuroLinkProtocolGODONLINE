import { P2PManager, type P2PMessage, type PlayerConnection } from './p2p';
import { GameStateManager, type GamePhase } from './gameState';
import { generateSecretWord } from './gameMaster';
import { soundManager } from './soundManager';
import { wakeLockManager } from './wakeLock';
import { type GamePlayer } from './gameState';

export class GameController {
  private p2p: P2PManager;
  private gameState: GameStateManager;
  private apiKey: string = '';

  constructor() {
    this.p2p = new P2PManager();
    this.gameState = new GameStateManager();
    this.setupP2PHandlers();
  }

  private setupP2PHandlers(): void {
    this.p2p.onMessage((message: P2PMessage) => {
      this.handleP2PMessage(message);
    });

    this.p2p.onPlayerJoin((player: PlayerConnection) => {
      const gamePlayer: GamePlayer = {
        id: player.id,
        name: player.name,
        isHost: false,
        signalStrength: 100
      };
      this.gameState.addPlayer(gamePlayer);
      soundManager.playSynthSound('connect');
    });

    this.p2p.onPlayerLeave((playerId: string) => {
      this.gameState.removePlayer(playerId);
      soundManager.playSynthSound('error');
    });

    this.p2p.onConnectionError((error: Error) => {
      console.error('[GAME] Connection error:', error);
    });
  }

  private handleP2PMessage(message: P2PMessage): void {
    console.log('[GAME] Received message:', message.type, message.data);

    switch (message.type) {
      case 'sync-state':
        this.handleSyncState(message);
        break;
      case 'start-game':
        this.handleStartGame(message);
        break;
      case 'role-assignment':
        this.handleRoleAssignment(message);
        break;
      case 'turn-start':
        this.handleTurnStart(message);
        break;
      case 'turn-end':
        this.handleTurnEnd();
        break;
      case 'vote-cast':
        this.handleVoteCast(message);
        break;
      case 'game-over':
        this.handleGameOver(message);
        break;
      case 'noise-bomb':
        this.handleNoiseBomb();
        break;
    }
  }

  async createRoom(playerName: string): Promise<void> {
    const roomCode = await this.p2p.createRoom(playerName);
    const localPlayerId = this.p2p.getLocalPlayerId();
    
    this.gameState.setState({
      phase: 'lobby',
      roomCode,
      localPlayerId,
      hostPlayerId: localPlayerId,
      players: [{
        id: localPlayerId,
        name: playerName,
        isHost: true,
        signalStrength: 100
      }]
    });

    soundManager.playSynthSound('success');
    await wakeLockManager.request();
  }

  async joinRoom(playerName: string, roomCode: string): Promise<void> {
    await this.p2p.joinRoom(playerName, roomCode);
    const localPlayerId = this.p2p.getLocalPlayerId();
    
    this.gameState.setState({
      phase: 'lobby',
      roomCode,
      localPlayerId,
      hostPlayerId: roomCode,
      players: []
    });

    soundManager.playSynthSound('success');
    await wakeLockManager.request();
  }

  private handleSyncState(message: P2PMessage): void {
    const { players } = message.data;
    
    const gamePlayers: GamePlayer[] = players.map((p: any) => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      signalStrength: 100
    }));

    const localPlayerId = this.gameState.getState().localPlayerId;
    if (!gamePlayers.find(p => p.id === localPlayerId)) {
      gamePlayers.push({
        id: localPlayerId,
        name: this.p2p.getLocalPlayerName(),
        isHost: false,
        signalStrength: 100
      });
    }

    this.gameState.setState({
      players: gamePlayers,
      hostPlayerId: players.find((p: any) => p.isHost)?.id || message.senderId
    });
  }

  async startGame(playOnHost: boolean): Promise<void> {
    if (!this.gameState.isLocalPlayerHost()) {
      console.error('[GAME] Only host can start game');
      return;
    }

    this.gameState.setState({ playOnHost });

    const secretWord = await generateSecretWord(this.apiKey);
    console.log('[GAME] Generated secret word:', secretWord);

    const players = this.gameState.getState().players;
    const eligiblePlayers = playOnHost 
      ? players 
      : players.filter(p => !p.isHost);

    if (eligiblePlayers.length < 3) {
      console.error('[GAME] Not enough players');
      return;
    }

    const impostorIndex = Math.floor(Math.random() * eligiblePlayers.length);
    const impostorId = eligiblePlayers[impostorIndex].id;

    this.gameState.assignRoles(impostorId, secretWord);
    this.gameState.setPhase('role-reveal');

    this.p2p.broadcast({
      type: 'start-game',
      data: { playOnHost }
    });

    this.p2p.broadcast({
      type: 'role-assignment',
      data: { 
        impostorId, 
        secretWord: secretWord.word,
        category: secretWord.category
      }
    });

    soundManager.playSynthSound('success');

    setTimeout(() => {
      this.startGameplay();
    }, 5000);
  }

  private handleStartGame(message: P2PMessage): void {
    this.gameState.setState({ playOnHost: message.data.playOnHost });
    this.gameState.setPhase('role-reveal');
  }

  private handleRoleAssignment(message: P2PMessage): void {
    const { impostorId, secretWord, category } = message.data;
    this.gameState.assignRoles(impostorId, { word: secretWord, category });

    setTimeout(() => {
      this.gameState.setPhase('gameplay');
    }, 5000);
  }

  private startGameplay(): void {
    const state = this.gameState.getState();
    const eligiblePlayers = state.playOnHost 
      ? state.players 
      : state.players.filter(p => !p.isHost);

    if (eligiblePlayers.length === 0) return;

    const firstPlayerId = eligiblePlayers[0].id;
    this.gameState.startTurn(firstPlayerId);
    this.gameState.setPhase('gameplay');

    if (this.gameState.isLocalPlayerHost()) {
      this.p2p.broadcast({
        type: 'turn-start',
        data: { playerId: firstPlayerId }
      });
    }
  }

  private handleTurnStart(message: P2PMessage): void {
    this.gameState.startTurn(message.data.playerId);
    soundManager.playSynthSound('timer');
  }

  endTurn(): void {
    this.gameState.endTurn();

    if (this.gameState.isLocalPlayerHost()) {
      this.p2p.broadcast({
        type: 'turn-end',
        data: {}
      });

      this.nextTurn();
    }
  }

  private handleTurnEnd(): void {
    this.gameState.endTurn();
  }

  private nextTurn(): void {
    const state = this.gameState.getState();
    const eligiblePlayers = state.playOnHost 
      ? state.players 
      : state.players.filter(p => !p.isHost);

    const currentIndex = eligiblePlayers.findIndex(p => p.id === state.activePlayerId);
    const nextIndex = (currentIndex + 1) % eligiblePlayers.length;

    if (nextIndex === 0) {
      this.startVoting();
    } else {
      const nextPlayerId = eligiblePlayers[nextIndex].id;
      this.gameState.startTurn(nextPlayerId);
      this.p2p.broadcast({
        type: 'turn-start',
        data: { playerId: nextPlayerId }
      });
    }
  }

  private startVoting(): void {
    this.gameState.setPhase('voting');
    soundManager.playSynthSound('timer');
  }

  castVote(targetId: string): void {
    const localPlayerId = this.gameState.getState().localPlayerId;
    this.gameState.castVote(localPlayerId, targetId);

    this.p2p.broadcast({
      type: 'vote-cast',
      data: { voterId: localPlayerId, targetId }
    });

    soundManager.playSynthSound('connect');

    if (this.gameState.isLocalPlayerHost()) {
      this.checkAllVoted();
    }
  }

  private handleVoteCast(message: P2PMessage): void {
    const { voterId, targetId } = message.data;
    this.gameState.castVote(voterId, targetId);

    if (this.gameState.isLocalPlayerHost()) {
      this.checkAllVoted();
    }
  }

  private checkAllVoted(): void {
    const state = this.gameState.getState();
    const eligiblePlayers = state.playOnHost 
      ? state.players 
      : state.players.filter(p => !p.isHost);
    
    const allVoted = eligiblePlayers.every(p => p.hasVoted);

    if (allVoted) {
      setTimeout(() => {
        this.endGame();
      }, 2000);
    }
  }

  private endGame(): void {
    const eliminatedId = this.gameState.tallyVotes();
    const state = this.gameState.getState();

    let winner: 'hackers' | 'impostor';
    
    if (eliminatedId === state.impostorPlayerId) {
      winner = 'hackers';
    } else {
      winner = 'impostor';
    }

    this.gameState.setWinner(winner);
    this.gameState.setPhase('game-over');

    this.p2p.broadcast({
      type: 'game-over',
      data: { winner }
    });

    soundManager.playSynthSound(winner === 'hackers' ? 'success' : 'error');
  }

  private handleGameOver(message: P2PMessage): void {
    this.gameState.setWinner(message.data.winner);
    this.gameState.setPhase('game-over');
    soundManager.playSynthSound(message.data.winner === 'hackers' ? 'success' : 'error');
  }

  noiseBomb(): void {
    soundManager.playSynthSound('glitch');
    soundManager.vibrate([100, 50, 100, 50, 100]);

    this.p2p.broadcast({
      type: 'noise-bomb',
      data: {}
    });
    
    if (this.gameState.isLocalPlayerHost()) {
      this.p2p.broadcast({
        type: 'noise-bomb',
        data: {}
      });
    }
  }

  private handleNoiseBomb(): void {
    soundManager.playSynthSound('glitch');
    soundManager.vibrate([100, 50, 100, 50, 100]);
  }

  playAgain(): void {
    this.gameState.resetForNewGame();
    
    if (this.gameState.isLocalPlayerHost()) {
      this.startGame(this.gameState.getState().playOnHost);
    }
  }

  backToLobby(): void {
    this.gameState.setPhase('lobby');
    this.gameState.resetForNewGame();
  }

  setApiKey(key: string): void {
    this.apiKey = key;
  }

  getState() {
    return this.gameState.getState();
  }

  onStateChange(callback: (state: any) => void): void {
    this.gameState.onStateChange(callback);
  }

  disconnect(): void {
    this.p2p.disconnect();
    this.gameState.cleanup();
    wakeLockManager.release();
  }
}
