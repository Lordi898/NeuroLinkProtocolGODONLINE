import { type Player } from '@/components/PlayerList';
import { type WordData } from '@/data/fallbackWords';

export type GamePhase = 'join' | 'profile' | 'lobby' | 'role-reveal' | 'gameplay' | 'clue-display' | 'voting' | 'voting-results' | 'game-over';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface GamePlayer extends Player {
  isImpostor?: boolean;
  hasVoted?: boolean;
  votedFor?: string;
  isEliminated?: boolean;
}

export interface Clue {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface VotingResult {
  playerId: string;
  playerName: string;
  voteCount: number;
  voters: { voterId: string; voterName: string }[];
}

export interface GameState {
  phase: GamePhase;
  roomCode: string;
  players: GamePlayer[];
  localPlayerId: string;
  hostPlayerId: string;
  activePlayerId?: string;
  secretWord?: WordData;
  turnTimeRemaining: number;
  playOnHost: boolean;
  votes: Map<string, string>;
  winner?: 'hackers' | 'impostor';
  impostorPlayerId?: string;
  chatMessages: ChatMessage[];
  turnRotationOffset: number;
  votingFrequency: number;
  roundCount: number;
  currentRound: number;
  currentClue?: Clue;
  votingTimeRemaining: number;
  votingResults: VotingResult[];
  eliminatedPlayerId?: string;
  adminMode: boolean;
}

export class GameStateManager {
  private state: GameState;
  private onStateChangeCallback: ((state: GameState) => void) | null = null;
  private turnTimer: number | null = null;

  constructor() {
    this.state = {
      phase: 'join',
      roomCode: '',
      players: [],
      localPlayerId: '',
      hostPlayerId: '',
      turnTimeRemaining: 60,
      playOnHost: false,
      votes: new Map(),
      chatMessages: [],
      turnRotationOffset: 0,
      votingFrequency: 1,
      roundCount: 0,
      currentRound: 0,
      votingTimeRemaining: 45,
      votingResults: [],
      adminMode: false,
    };
  }

  getState(): GameState {
    return { ...this.state };
  }

  setState(updates: Partial<GameState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyStateChange();
  }

  updatePlayer(playerId: string, updates: Partial<GamePlayer>): void {
    this.state.players = this.state.players.map(p => 
      p.id === playerId ? { ...p, ...updates } : p
    );
    this.notifyStateChange();
  }

  addPlayer(player: GamePlayer): void {
    if (!this.state.players.find(p => p.id === player.id)) {
      this.state.players.push(player);
      this.notifyStateChange();
    }
  }

  removePlayer(playerId: string): void {
    this.state.players = this.state.players.filter(p => p.id !== playerId);
    this.notifyStateChange();
  }

  setPhase(phase: GamePhase): void {
    this.state.phase = phase;
    this.notifyStateChange();
  }

  assignRoles(impostorId: string, secretWord: WordData): void {
    this.state.impostorPlayerId = impostorId;
    this.state.secretWord = secretWord;
    this.state.players = this.state.players.map(p => ({
      ...p,
      isImpostor: p.id === impostorId
    }));
    this.notifyStateChange();
  }

  startTurn(playerId: string): void {
    this.state.activePlayerId = playerId;
    this.state.turnTimeRemaining = 60;
    this.notifyStateChange();
    this.startTurnTimer();
  }

  private startTurnTimer(): void {
    if (this.turnTimer) {
      clearInterval(this.turnTimer);
    }

    this.turnTimer = window.setInterval(() => {
      if (this.state.turnTimeRemaining > 0) {
        this.state.turnTimeRemaining--;
        this.notifyStateChange();
      } else {
        this.endTurn();
      }
    }, 1000);
  }

  endTurn(): void {
    if (this.turnTimer) {
      clearInterval(this.turnTimer);
      this.turnTimer = null;
    }
  }

  castVote(voterId: string, targetId: string): void {
    this.state.votes.set(voterId, targetId);
    this.updatePlayer(voterId, { hasVoted: true, votedFor: targetId });
  }

  tallyVotes(): string | null {
    const voteCounts = new Map<string, number>();
    
    this.state.votes.forEach((targetId) => {
      voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
    });

    let maxVotes = 0;
    let eliminatedPlayer: string | null = null;
    let isTie = false;

    voteCounts.forEach((count, playerId) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedPlayer = playerId;
        isTie = false;
      } else if (count === maxVotes) {
        isTie = true;
      }
    });

    return isTie ? null : eliminatedPlayer;
  }

  setWinner(winner: 'hackers' | 'impostor'): void {
    this.state.winner = winner;
    this.notifyStateChange();
  }

  addChatMessage(message: ChatMessage): void {
    if (!this.state.chatMessages.find(m => m.id === message.id)) {
      this.state.chatMessages.push(message);
      this.notifyStateChange();
    }
  }

  clearChat(): void {
    this.state.chatMessages = [];
    this.notifyStateChange();
  }

  resetForNewGame(): void {
    this.state = {
      ...this.state,
      phase: 'lobby',
      activePlayerId: undefined,
      secretWord: undefined,
      turnTimeRemaining: 15,
      votes: new Map(),
      winner: undefined,
      impostorPlayerId: undefined,
      chatMessages: [],
      turnRotationOffset: this.state.turnRotationOffset + 1,
      roundCount: 0,
      currentRound: 0,
      votingTimeRemaining: 45,
      votingResults: [],
      eliminatedPlayerId: undefined,
      currentClue: undefined,
      players: this.state.players.filter(p => !p.isEliminated).map(p => ({
        ...p,
        isImpostor: false,
        hasVoted: false,
        votedFor: undefined,
        isEliminated: false
      }))
    };
    this.notifyStateChange();
  }

  addClue(clue: Clue): void {
    this.state.currentClue = clue;
    this.notifyStateChange();
  }

  setVotingFrequency(frequency: number): void {
    this.state.votingFrequency = frequency;
    this.notifyStateChange();
  }

  eliminatePlayer(playerId: string): void {
    this.state.players = this.state.players.map(p => 
      p.id === playerId ? { ...p, isEliminated: true } : p
    );
    this.notifyStateChange();
  }

  removeEliminatedPlayers(): void {
    this.state.players = this.state.players.filter(p => !p.isEliminated);
    this.notifyStateChange();
  }

  setVotingResults(results: VotingResult[]): void {
    this.state.votingResults = results;
    this.notifyStateChange();
  }

  incrementRound(): void {
    this.state.currentRound++;
    this.notifyStateChange();
  }

  startVotingTimer(): void {
    if (this.turnTimer) {
      clearInterval(this.turnTimer);
    }

    this.turnTimer = window.setInterval(() => {
      if (this.state.votingTimeRemaining > 0) {
        this.state.votingTimeRemaining--;
        this.notifyStateChange();
      } else {
        this.endVotingTimer();
      }
    }, 1000);
  }

  endVotingTimer(): void {
    if (this.turnTimer) {
      clearInterval(this.turnTimer);
      this.turnTimer = null;
    }
  }

  getLocalPlayer(): GamePlayer | undefined {
    return this.state.players.find(p => p.id === this.state.localPlayerId);
  }

  isLocalPlayerHost(): boolean {
    return this.state.localPlayerId === this.state.hostPlayerId;
  }

  isLocalPlayerImpostor(): boolean {
    return this.getLocalPlayer()?.isImpostor || false;
  }

  onStateChange(callback: (state: GameState) => void): void {
    this.onStateChangeCallback = callback;
  }

  private notifyStateChange(): void {
    this.onStateChangeCallback?.(this.getState());
  }

  cleanup(): void {
    if (this.turnTimer) {
      clearInterval(this.turnTimer);
      this.turnTimer = null;
    }
  }
}
