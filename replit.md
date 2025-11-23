# Neuro-Link Protocol Zero - Project State

## Project Overview
A P2P cyberpunk social deduction game built with React featuring multiple visual styles, theme modes, and a comprehensive progression system.

## Current Status
- **Progression System**: Fully implemented with localStorage persistence
- **Avatars**: 30 avatars across 3 tiers (Starter/Intermediate/Elite)
- **Themes**: 3 unlockable themes with conditions
- **Admin Mode**: Active with secret code
- **Languages**: English and Spanish support

## User Preferences
- **Admin Code**: LORDI (ultra secret - do not expose)
- **Language**: Spanish support required
- **Style Modes**: Hacker/Default, Futurista, Retro (retro uses same font sizes as default)

## Architecture
- **Frontend**: React with Wouter routing, TanStack Query, shadcn/ui
- **Styling**: Tailwind CSS + custom CSS variables for dark/light/themes
- **State Management**: ProgressionContext (localStorage), LanguageContext
- **Game Logic**: P2P with PeerJS for networking

## Key Features Implemented
1. **Progression System**: 
   - XP tracking (100 for wins, 50 for participation)
   - Rank levels 1-10
   - Win/Impostor streak tracking
   - Unlocked avatars and themes persisted in localStorage

2. **Profile/Armory Page**: Shows user stats, level progress, avatar grid, theme display

3. **Theme Unlocks**:
   - Matrix Retro: 3-win streak
   - Obsidian Lux: First impostor win
   - Quantum Divinity: 3-impostor streak

4. **Game-Over Progression**: Integrated into GameOverScreen with automatic XP awards and theme unlocks

5. **Admin Mode**: Allows single-player games and bypasses 3-player minimum

## Important Files
- `client/src/lib/progressionContext.tsx` - Progression state management
- `client/src/lib/useGameOverProgression.ts` - Game-over XP and unlock logic
- `client/src/lib/avatars.ts` - Avatar definitions (30 total)
- `client/src/pages/Profile.tsx` - Profile and Armory display
- `client/src/components/game/JoinScreen.tsx` - Admin mode entry point
- `client/src/components/game/GameOverScreen.tsx` - Game-over with progression integration
- `client/src/lib/languageContext.tsx` - Language and theme translations

## Design Choices
- Used in-memory storage for progression (localStorage)
- Progression persists across sessions automatically
- Admin code verification on JoinScreen before enabling mode
- Theme unlocks show toast notifications with custom messages
