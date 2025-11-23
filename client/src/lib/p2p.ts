import Peer, { DataConnection } from 'peerjs';

export type MessageType =
  | 'player-join'
  | 'player-leave'
  | 'start-game'
  | 'role-assignment'
  | 'turn-start'
  | 'turn-end'
  | 'vote-cast'
  | 'game-over'
  | 'noise-bomb'
  | 'sync-state'
  | 'chat-message'
  | 'clue-display'
  | 'voting-results'
  | 'player-eliminated'
  | 'game-ended-admin'
  | 'voting-start'
  | 'player-kicked';

export interface P2PMessage {
  type: MessageType;
  data: any;
  senderId: string;
  timestamp: number;
}

export interface PlayerConnection {
  id: string;
  name: string;
  connection: DataConnection;
  isHost: boolean;
}

export class P2PManager {
  private ws: WebSocket | null = null;
  private connections: Map<string, PlayerConnection> = new Map();
  private localPlayerId: string = '';
  private localPlayerName: string = '';
  private isHost: boolean = false;
  private roomCode: string = '';

  private onMessageCallback: ((message: P2PMessage) => void) | null = null;
  private onPlayerJoinCallback: ((player: PlayerConnection) => void) | null = null;
  private onPlayerLeaveCallback: ((playerId: string) => void) | null = null;
  private onConnectionErrorCallback: ((error: Error) => void) | null = null;
  private getSyncDataCallback: (() => any) | null = null;

  async createRoom(playerName: string): Promise<string> {
    this.localPlayerName = playerName;
    this.isHost = true;

    try {
      const response = await fetch('/api/rooms/create', { method: 'POST' });
      const data = await response.json();
      
      this.roomCode = data.roomCode;
      this.localPlayerId = data.playerId;
      
      // Connect via WebSocket
      this.connectWebSocket(playerName);
      
      console.log('[P2P] Room created with code:', this.roomCode);
      return this.roomCode;
    } catch (error) {
      console.error('[P2P] Error creating room:', error);
      throw error;
    }
  }

  async joinRoom(playerName: string, roomCode: string): Promise<void> {
    this.localPlayerName = playerName;
    this.isHost = false;
    this.roomCode = roomCode;

    try {
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode })
      });
      
      if (!response.ok) throw new Error('Failed to join room');
      
      const data = await response.json();
      this.localPlayerId = data.playerId;
      
      // Connect via WebSocket
      this.connectWebSocket(playerName);
      
      console.log('[P2P] Joined room:', roomCode, 'as player:', this.localPlayerId);
    } catch (error) {
      console.error('[P2P] Error joining room:', error);
      throw error;
    }
  }

  private connectWebSocket(playerName: string): void {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?room=${this.roomCode}&playerId=${this.localPlayerId}&name=${encodeURIComponent(playerName)}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('[P2P] WebSocket connected to room:', this.roomCode);
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'players-list') {
          // Initial list of players in the room
          const { players } = message.data;
          this.connections.clear();
          players.forEach((p: any) => {
            if (p.id !== this.localPlayerId) {
              const playerConnection: PlayerConnection = {
                id: p.id,
                name: p.name,
                connection: null as any,
                isHost: false
              };
              this.connections.set(p.id, playerConnection);
              this.onPlayerJoinCallback?.(playerConnection);
            }
          });
          console.log('[P2P] Received players list:', players.length, 'players');
        } else if (message.type === 'player-joined') {
          const { playerId, playerName } = message.data;
          if (playerId !== this.localPlayerId) {
            const playerConnection: PlayerConnection = {
              id: playerId,
              name: playerName,
              connection: null as any,
              isHost: false
            };
            this.connections.set(playerId, playerConnection);
            this.onPlayerJoinCallback?.(playerConnection);
            console.log('[P2P] Player joined:', playerName);
          }
        } else if (message.type === 'player-left') {
          const { playerId } = message.data;
          this.connections.delete(playerId);
          this.onPlayerLeaveCallback?.(playerId);
          console.log('[P2P] Player left:', playerId);
        } else {
          this.onMessageCallback?.(message);
        }
      } catch (error) {
        console.error('[P2P] Message parse error:', error);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('[P2P] WebSocket error:', error);
      this.onConnectionErrorCallback?.(new Error('WebSocket error'));
    };
    
    this.ws.onclose = () => {
      console.log('[P2P] WebSocket closed');
      this.ws = null;
    };
  }

  private handleIncomingConnection(conn: DataConnection): void {
    console.log('[P2P] Incoming connection from:', conn.peer);

    let playerName = '';

    conn.on('data', (data: any) => {
      const message = data as P2PMessage;

      if (message.type === 'player-join' && !this.connections.has(conn.peer)) {
        playerName = message.data.playerName;
        const playerConnection: PlayerConnection = {
          id: conn.peer,
          name: playerName,
          connection: conn,
          isHost: false
        };

        this.connections.set(conn.peer, playerConnection);
        this.onPlayerJoinCallback?.(playerConnection);

        this.syncStateToPlayer(conn.peer);
        this.broadcastToOthers({
          type: 'player-join',
          data: {
            playerId: conn.peer,
            playerName
          },
          senderId: this.localPlayerId,
          timestamp: Date.now()
        }, conn.peer);
      } else {
        this.onMessageCallback?.(message);
      }
    });

    conn.on('close', () => {
      console.log('[P2P] Connection closed:', conn.peer);
      const playerId = conn.peer;
      this.connections.delete(playerId);
      this.onPlayerLeaveCallback?.(playerId);

      if (this.isHost) {
        this.broadcast({
          type: 'player-leave',
          data: { playerId }
        });
      }
    });

    conn.on('error', (error) => {
      console.error('[P2P] Connection error:', error);
    });
  }

  private setupConnection(conn: DataConnection, playerName: string, sendJoinMessage: boolean): void {
    if (sendJoinMessage) {
      conn.on('open', () => {
        this.sendMessage({
          type: 'player-join',
          data: { playerName: this.localPlayerName }
        }, conn.peer);
      });
    }

    conn.on('data', (data: any) => {
      const message = data as P2PMessage;
      this.onMessageCallback?.(message);
    });

    conn.on('close', () => {
      console.log('[P2P] Connection closed:', conn.peer);
      this.connections.delete(conn.peer);
      this.onPlayerLeaveCallback?.(conn.peer);
    });

    conn.on('error', (error) => {
      console.error('[P2P] Connection error:', error);
    });
  }

  broadcast(message: Omit<P2PMessage, 'senderId' | 'timestamp'>): void {
    const fullMessage: P2PMessage = {
      ...message,
      senderId: this.localPlayerId,
      timestamp: Date.now()
    };

    this.connections.forEach((player) => {
      try {
        player.connection.send(fullMessage);
      } catch (error) {
        console.error('[P2P] Failed to send to', player.id, error);
      }
    });
  }

  private broadcastToOthers(message: P2PMessage, excludeId: string): void {
    this.connections.forEach((player) => {
      if (player.id !== excludeId) {
        try {
          player.connection.send(message);
        } catch (error) {
          console.error('[P2P] Failed to send to', player.id, error);
        }
      }
    });
  }

  sendMessage(message: Omit<P2PMessage, 'senderId' | 'timestamp'>, targetId: string): void {
    const player = this.connections.get(targetId);
    if (player) {
      const fullMessage: P2PMessage = {
        ...message,
        senderId: this.localPlayerId,
        timestamp: Date.now()
      };
      player.connection.send(fullMessage);
    }
  }

  private syncStateToPlayer(playerId: string): void {
    const allPlayers = Array.from(this.connections.values()).map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost
    }));

    allPlayers.push({
      id: this.localPlayerId,
      name: this.localPlayerName,
      isHost: this.isHost
    });

    const additionalData = this.getSyncDataCallback?.() || {};

    this.sendMessage({
      type: 'sync-state',
      data: {
        players: allPlayers,
        ...additionalData
      }
    }, playerId);
  }

  onMessage(callback: (message: P2PMessage) => void): void {
    this.onMessageCallback = callback;
  }

  onPlayerJoin(callback: (player: PlayerConnection) => void): void {
    this.onPlayerJoinCallback = callback;
  }

  onPlayerLeave(callback: (playerId: string) => void): void {
    this.onPlayerLeaveCallback = callback;
  }

  onConnectionError(callback: (error: Error) => void): void {
    this.onConnectionErrorCallback = callback;
  }

  onGetSyncData(callback: () => any): void {
    this.getSyncDataCallback = callback;
  }

  getTurnRotationOffset(): number {
    const syncData = this.onGetSyncDataCallback?.() || {};
    return syncData.turnRotationOffset || 0;
  }

  getLocalPlayerId(): string {
    return this.localPlayerId;
  }

  getLocalPlayerName(): string {
    return this.localPlayerName;
  }

  isRoomHost(): boolean {
    return this.isHost;
  }

  getRoomCode(): string {
    return this.roomCode;
  }

  getConnectedPlayers(): PlayerConnection[] {
    return Array.from(this.connections.values());
  }

  disconnect(): void {
    this.connections.forEach((player) => {
      player.connection.close();
    });
    this.connections.clear();
    this.peer?.destroy();
    this.peer = null;
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}