import { P2PManager, type P2PMessage, type PlayerConnection } from './p2p';
import { GameStateManager, type GamePhase, type ChatMessage } from './gameState';
import { generateSecretWord } from './gameMaster';
import { soundManager } from './soundManager';
import { wakeLockManager } from './wakeLock';
import { type GamePlayer } from './gameState';
import {
  sanitizeText,
  sanitizePlayerName,
  sanitizeClue,
  checkMessageRateLimit,
  checkVoteRateLimit,
  validatePlayerId,
  validateMessageContent,
  validateClueContent,
  clearRateLimits
} from './validation';

export class GameController {
  private p2p: P2PManager;
  private gameState: GameStateManager;

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

    this.p2p.onGetSyncData(() => {
      const state = this.gameState.getState();
      return {
        chatMessages: state.chatMessages,
        turnRotationOffset: state.turnRotationOffset
      };
    });
  }

  private handleP2PMessage(message: P2PMessage): void {
    console.log('[GAME] Received message:', message.type, message.data);

    switch (message.type) {
      case 'sync-state':
        this.handleSyncState(message);
        break;
      case 'player-join':
        this.handlePlayerJoinMessage(message);
        break;
      case 'player-leave':
        this.handlePlayerLeaveMessage(message);
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
      case 'clue-display':
        this.handleClueDisplay(message);
        break;
      case 'vote-cast':
        this.handleVoteCast(message);
        break;
      case 'voting-results':
        this.handleVotingResults(message);
        break;
      case 'game-over':
        this.handleGameOver(message);
        break;
      case 'noise-bomb':
        this.handleNoiseBomb();
        break;
      case 'chat-message':
        this.handleChatMessage(message);
        break;
      case 'player-eliminated':
        this.handlePlayerEliminated(message);
        break;
    }
  }

  private handlePlayerJoinMessage(message: P2PMessage): void {
    const { playerId, playerName } = message.data;
    
    if (!this.gameState.getState().players.find(p => p.id === playerId)) {
      const gamePlayer: GamePlayer = {
        id: playerId,
        name: playerName,
        isHost: false,
        signalStrength: 100
      };
      this.gameState.addPlayer(gamePlayer);
      soundManager.playSynthSound('connect');
      console.log('[GAME] Player joined via broadcast:', playerName);
    }
  }

  private handlePlayerLeaveMessage(message: P2PMessage): void {
    const { playerId } = message.data;
    this.gameState.removePlayer(playerId);
    soundManager.playSynthSound('error');
    console.log('[GAME] Player left via broadcast:', playerId);
  }

  async createRoom(playerName: string): Promise<void> {
    const sanitizedName = sanitizePlayerName(playerName);
    const roomCode = await this.p2p.createRoom(sanitizedName);
    const localPlayerId = this.p2p.getLocalPlayerId();
    
    this.gameState.setState({
      phase: 'lobby',
      roomCode,
      localPlayerId,
      hostPlayerId: localPlayerId,
      players: [{
        id: localPlayerId,
        name: sanitizedName,
        isHost: true,
        signalStrength: 100
      }]
    });

    soundManager.playSynthSound('success');
    await wakeLockManager.request();
  }

  async joinRoom(playerName: string, roomCode: string): Promise<void> {
    const sanitizedName = sanitizePlayerName(playerName);
    await this.p2p.joinRoom(sanitizedName, roomCode);
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
    const { players, chatMessages, turnRotationOffset } = message.data;
    
    if (players) {
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
        hostPlayerId: players.find((p: any) => p.isHost)?.id || message.senderId,
        turnRotationOffset: turnRotationOffset !== undefined ? turnRotationOffset : 0
      });
    }
    
    if (chatMessages && Array.isArray(chatMessages)) {
      chatMessages.forEach((msg: ChatMessage) => {
        this.gameState.addChatMessage(msg);
      });
    }
  }

  leaveGame(): void {
    this.p2p.disconnect();
    this.gameState.setState({
      phase: 'join',
      players: [],
      roomCode: '',
      localPlayerId: '',
      hostPlayerId: ''
    });
  }

  endGameAdmin(): void {
    this.p2p.broadcast({
      type: 'game-ended-admin',
      data: { message: 'Game ended by admin - no XP awarded' }
    });
    this.gameState.setState({
      phase: 'join',
      players: [],
      roomCode: '',
      localPlayerId: '',
      hostPlayerId: ''
    });
    this.p2p.disconnect();
  }

  async startGame(playOnHost: boolean, language: 'en' | 'es' = 'en', adminMode: boolean = false): Promise<void> {
    if (!this.gameState.isLocalPlayerHost()) {
      console.error('[GAME] Only host can start game');
      return;
    }

    const players = this.gameState.getState().players;
    
    // In admin mode with 1-2 players, force playOnHost to true
    const finalPlayOnHost = adminMode && players.length <= 2 ? true : playOnHost;
    
    this.gameState.setState({ playOnHost: finalPlayOnHost, adminMode });

    const secretWord = await generateSecretWord(language);
    console.log('[GAME] Generated secret word:', secretWord);

    const eligiblePlayers = finalPlayOnHost 
      ? players 
      : players.filter(p => !p.isHost);

    const minPlayers = adminMode ? 1 : 3;
    if (eligiblePlayers.length < minPlayers) {
      console.error('[GAME] Not enough players. Need at least ' + minPlayers + ', have ' + eligiblePlayers.length);
      return;
    }

    if (eligiblePlayers.length === 0) {
      console.error('[GAME] No eligible players found');
      return;
    }

    const impostorIndex = Math.floor(Math.random() * eligiblePlayers.length);
    const impostorId = eligiblePlayers[impostorIndex]?.id;
    
    if (!impostorId) {
      console.error('[GAME] Failed to select impostor. eligiblePlayers:', eligiblePlayers);
      return;
    }

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

    const startIndex = state.turnRotationOffset % eligiblePlayers.length;
    const firstPlayerId = eligiblePlayers[startIndex].id;
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

    // Broadcast to everyone that the turn ended
    this.p2p.broadcast({
      type: 'turn-end',
      data: {}
    });

    // Only host calculates next turn
    if (this.gameState.isLocalPlayerHost()) {
      this.nextTurn();
    }
  }

  private handleTurnEnd(): void {
    this.gameState.endTurn();

    // If we're the host, calculate next turn
    if (this.gameState.isLocalPlayerHost()) {
      this.nextTurn();
    }
  }

  private nextTurn(): void {
    const state = this.gameState.getState();
    const eligiblePlayers = state.playOnHost 
      ? state.players.filter(p => !p.isEliminated)
      : state.players.filter(p => !p.isHost && !p.isEliminated);

    const currentIndex = eligiblePlayers.findIndex(p => p.id === state.activePlayerId);
    const nextIndex = (currentIndex + 1) % eligiblePlayers.length;

    if (nextIndex === 0) {
      this.gameState.incrementRound();
      const shouldVote = state.currentRound % state.votingFrequency === 0;
      if (shouldVote) {
        this.startObligatoryVoting();
      } else {
        const nextPlayerId = eligiblePlayers[0].id;
        this.gameState.startTurn(nextPlayerId);
        this.p2p.broadcast({
          type: 'turn-start',
          data: { playerId: nextPlayerId }
        });
      }
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

  private startObligatoryVoting(): void {
    const state = this.gameState.getState();
    this.gameState.setState({
      phase: 'voting',
      votes: new Map(),
      votingTimeRemaining: 45,
      players: state.players.map(p => ({ ...p, hasVoted: false, votedFor: undefined }))
    });
    this.gameState.startVotingTimer();
    this.p2p.broadcast({
      type: 'voting-start',
      data: {}
    });
  }

  castVote(targetId: string): void {
    const localPlayerId = this.gameState.getState().localPlayerId;
    
    // Validate vote
    if (!validatePlayerId(localPlayerId) || !validatePlayerId(targetId)) {
      console.error('[GAME] Invalid vote - invalid player IDs');
      return;
    }
    
    if (!checkVoteRateLimit(localPlayerId)) {
      console.warn('[GAME] Vote rate limited for player:', localPlayerId);
      return;
    }
    
    const state = this.gameState.getState();
    const targetPlayer = state.players.find(p => p.id === targetId);
    if (!targetPlayer || targetPlayer.isEliminated) {
      console.error('[GAME] Cannot vote for eliminated or non-existent player');
      return;
    }
    
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
    
    // Validate vote data
    if (!validatePlayerId(voterId) || !validatePlayerId(targetId)) {
      console.error('[GAME] Invalid vote received - invalid player IDs');
      return;
    }
    
    const state = this.gameState.getState();
    const voter = state.players.find(p => p.id === voterId);
    const target = state.players.find(p => p.id === targetId);
    
    if (!voter || !target || voter.isEliminated || target.isEliminated) {
      console.error('[GAME] Invalid vote - eliminated or non-existent players');
      return;
    }
    
    // Prevent double voting
    if (voter.hasVoted && voter.votedFor !== targetId) {
      console.warn('[GAME] Player attempted to vote twice:', voterId);
      return;
    }
    
    this.gameState.castVote(voterId, targetId);

    if (this.gameState.isLocalPlayerHost()) {
      this.checkAllVoted();
    }
  }

  private checkAllVoted(): void {
    const state = this.gameState.getState();
    const playersToVote = state.players.filter(p => !p.isEliminated);
    
    const allVoted = playersToVote.every(p => p.hasVoted);

    if (allVoted) {
      setTimeout(() => {
        this.tallyVotesAndShowResults();
      }, 2000);
    }
  }

  private tallyVotesAndShowResults(): void {
    const state = this.gameState.getState();
    const voteCounts = new Map<string, { count: number; voters: Array<{ voterId: string; voterName: string }> }>();
    
    state.players.forEach(player => {
      if (player.votedFor) {
        const current = voteCounts.get(player.votedFor) || { count: 0, voters: [] };
        current.count++;
        current.voters.push({ voterId: player.id, voterName: player.name });
        voteCounts.set(player.votedFor, current);
      }
    });

    const results = Array.from(voteCounts.entries())
      .map(([playerId, data]) => {
        const player = state.players.find(p => p.id === playerId);
        return {
          playerId,
          playerName: player?.name || 'UNKNOWN',
          voteCount: data.count,
          voters: data.voters
        };
      })
      .sort((a, b) => b.voteCount - a.voteCount);

    this.gameState.setVotingResults(results);
    this.gameState.setPhase('voting-results');
    this.p2p.broadcast({
      type: 'voting-results',
      data: { results }
    });

    if (results.length === 0) {
      setTimeout(() => this.nextTurn(), 3000);
      return;
    }

    const maxVotes = results[0].voteCount;
    const topVotedPlayers = results.filter(r => r.voteCount === maxVotes);

    if (topVotedPlayers.length === 1) {
      const eliminatedId = topVotedPlayers[0].playerId;
      this.gameState.eliminatePlayer(eliminatedId);
      
      const remainingPlayers = state.players.filter(p => p.id !== eliminatedId && !p.isEliminated);
      const impostor = state.impostorPlayerId;
      
      if (eliminatedId === impostor) {
        this.endGameWithWinner('hackers');
      } else if (remainingPlayers.length <= 1) {
        this.endGameWithWinner('impostor');
      } else {
        setTimeout(() => this.nextTurn(), 3000);
      }
    } else {
      setTimeout(() => this.nextTurn(), 3000);
    }
  }

  private endGameWithWinner(winner: 'hackers' | 'impostor'): void {
    this.gameState.setWinner(winner);
    this.gameState.setPhase('game-over');

    this.p2p.broadcast({
      type: 'game-over',
      data: { winner }
    });

    soundManager.playSynthSound(winner === 'hackers' ? 'success' : 'error');
  }

  private endGame(): void {
    this.endGameWithWinner('impostor');
  }

  private handleClueDisplay(message: P2PMessage): void {
    const { clue } = message.data;
    this.gameState.addClue(clue);
    this.gameState.setPhase('clue-display');
  }

  private handleVotingResults(message: P2PMessage): void {
    this.gameState.setVotingResults(message.data.results);
    this.gameState.setPhase('voting-results');
  }

  private handlePlayerEliminated(message: P2PMessage): void {
    const { playerId } = message.data;
    this.gameState.eliminatePlayer(playerId);
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
    this.gameState.resetForNewGame();
  }


  sendChatMessage(text: string): void {
    const state = this.gameState.getState();
    const player = state.players.find(p => p.id === state.localPlayerId);
    
    if (!player || !text.trim()) return;

    const chatMessage: ChatMessage = {
      id: `${state.localPlayerId}-${Date.now()}`,
      senderId: state.localPlayerId,
      senderName: player.name,
      text: text.trim(),
      timestamp: Date.now()
    };

    this.gameState.addChatMessage(chatMessage);

    this.p2p.broadcast({
      type: 'chat-message',
      data: chatMessage
    });
  }

  private handleChatMessage(message: P2PMessage): void {
    const chatMessage = message.data as ChatMessage;
    this.gameState.addChatMessage(chatMessage);
    
    // If we're the host and received a chat message from a peer, relay it to all other peers
    if (this.gameState.isLocalPlayerHost() && message.senderId !== this.gameState.getState().localPlayerId) {
      this.p2p.broadcast({
        type: 'chat-message',
        data: chatMessage
      });
    }
  }

  setPlayOnHost(value: boolean): void {
    this.gameState.setState({ playOnHost: value });
  }

  setVotingFrequency(frequency: number): void {
    this.gameState.setVotingFrequency(frequency);
  }

  kickPlayer(playerId: string): void {
    if (!this.gameState.isLocalPlayerHost()) {
      console.error('[GAME] Only host can kick players');
      return;
    }

    this.gameState.removePlayer(playerId);
    this.p2p.broadcast({
      type: 'player-kicked',
      data: { playerId }
    });
  }

  submitClue(clueText: string): void {
    const state = this.gameState.getState();
    const player = state.players.find(p => p.id === state.localPlayerId);
    
    if (!player || state.activePlayerId !== state.localPlayerId) return;

    const clue = {
      id: `${state.localPlayerId}-${Date.now()}`,
      senderId: state.localPlayerId,
      senderName: player.name,
      text: clueText.trim(),
      timestamp: Date.now()
    };

    this.gameState.addClue(clue);
    this.p2p.broadcast({
      type: 'clue-display',
      data: { clue }
    });

    this.gameState.setPhase('clue-display');
    
    setTimeout(() => {
      this.endTurn();
    }, 3000);
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
