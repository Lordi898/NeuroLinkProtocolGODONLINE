# NEURO-LINK: Protocol Zero

## Overview
A cyberpunk-themed P2P local-multiplayer social deduction game built with React and WebRTC (PeerJS). Players work together to identify an impostor while describing a secret word without saying it directly.

## Current State
Complete and functional multiplayer game with:
- P2P networking via PeerJS for local multiplayer
- Host-authoritative game state management
- Hybrid word generation (Gemini API with fallback database)
- Full game loop: lobby, role assignment, turn-based gameplay, voting, game over
- Retro-futuristic hacker terminal aesthetic with CRT effects

## Recent Changes (2025-11-22)
- **Security Fix**: Moved Gemini API key to server-side only via POST /api/generate-word endpoint
- **P2P Sync Fix**: Added player-join/player-leave message handlers on all peers for proper roster synchronization
- **State Management Fix**: Fixed Play-on-host toggle to properly update GameStateManager via setPlayOnHost method
- **Sound System**: Enhanced vibration patterns and error handling for haptic feedback

## Project Architecture

### Backend (`server/`)
- **routes.ts**: Express routes including server-side Gemini word generation endpoint
- API endpoints:
  - POST `/api/generate-word`: Server-side word generation with Gemini API or fallback

### Frontend (`client/src/`)
- **lib/p2p.ts**: PeerJS networking layer, connection management, message broadcasting
- **lib/gameState.ts**: GameStateManager with phase transitions, player roster, roles
- **lib/gameController.ts**: Main game orchestrator integrating P2P and state management
- **lib/gameMaster.ts**: Word generation client (fetches from server endpoint)
- **lib/soundManager.ts**: Web Audio API synthesis, vibration patterns
- **lib/wakeLock.ts**: Screen wake lock to prevent sleep during gameplay

### Game Components
- **JoinScreen**: Create or join rooms with QR code support
- **LobbyScreen**: Player lobby with host controls and Play-on-host toggle
- **RoleRevealScreen**: Shows player's role (Hacker/Impostor) and secret word
- **GameplayScreen**: Turn-based gameplay with timer and word display
- **VotingScreen**: Vote for suspected impostor
- **GameOverScreen**: Results and replay options

## Game Flow
1. **Join Phase**: Host creates room, others join via room code or QR
2. **Lobby Phase**: Players gather, host configures Play-on-host option
3. **Start Game**: Host initiates, secret word generated from server
4. **Role Reveal**: Players see their role (5 seconds)
5. **Gameplay**: Players take turns describing the word (30s each)
6. **Voting**: All players vote for suspected impostor
7. **Game Over**: Results shown (Hackers win if impostor identified, Impostor wins otherwise)

## Technical Decisions

### P2P Architecture
- Host maintains authoritative state
- All state changes broadcast to peers
- Roster updates propagated via player-join/player-leave messages
- Reconnection handling with automatic cleanup

### Word Generation
- Server-side Gemini API integration for security
- 20-word fallback database for offline/API failure scenarios
- Categories: Technology, Food, Professions, Locations, Vehicles, Animals, Objects

### State Synchronization
- Host broadcasts full state on changes
- Non-host peers process message-driven updates
- GameStateManager notifies all listeners on state changes
- Play-on-host flag properly persisted in shared state

## Environment Variables
- `GEMINI_API_KEY`: Server-side Google Gemini API key (optional, falls back to local words)
- `SESSION_SECRET`: Express session secret

## Design Aesthetic
- Cyberpunk terminal theme: black background, neon accents (cyan/purple/green)
- JetBrains Mono monospace font
- All uppercase text for that terminal feel
- CRT scan line effects
- Glitch animations and hover states
- Synthesized audio and haptic feedback

## Known Limitations
- P2P requires all players on same local network or public internet
- PeerJS relies on their signaling server
- No game state persistence (reloading page loses state)
- Maximum recommended: 8-10 players per room
