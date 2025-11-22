
# NEURO-LINK: Protocol Zero

<div align="center">

![NEURO-LINK Banner](https://img.shields.io/badge/NEURO--LINK-Protocol%20Zero-00ff00?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDJMMiAyMmgyMHoiIGZpbGw9IiMwMGZmMDAiLz48L3N2Zz4=)

**A cyberpunk-themed P2P local-multiplayer social deduction game**

[![Run on Replit](https://replit.com/badge/github/yourusername/neuro-link)](https://replit.com/@yourusername/neuro-link)
[![License: MIT](https://img.shields.io/badge/License-MIT-00ff00.svg)](LICENSE)
[![Made with React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://react.dev)
[![WebRTC](https://img.shields.io/badge/WebRTC-PeerJS-ff00ff)](https://peerjs.com)

[Play Now](https://neuro-link.replit.app) • [Report Bug](https://github.com/yourusername/neuro-link/issues) • [Request Feature](https://github.com/yourusername/neuro-link/issues)

</div>

---

## 🎮 About The Game

**NEURO-LINK: Protocol Zero** is a real-time multiplayer social deduction game where players work together to identify an impostor among them. Set in a retro-futuristic cyberpunk world, players must describe a secret word without saying it directly—except for one player who doesn't know the word and must blend in to avoid detection.

### Key Features

- 🌐 **P2P Networking** - No central server required; players connect directly via WebRTC
- 🎨 **Cyberpunk Aesthetic** - Terminal-style UI with CRT effects and neon accents
- 🤖 **AI-Powered Words** - Dynamic word generation using Google Gemini API with offline fallback
- 📱 **Mobile-Friendly** - Full touch support with haptic feedback and wake lock
- 🔊 **Synthesized Audio** - Web Audio API for retro sound effects
- 📊 **QR Code Joining** - Scan to join rooms instantly
- 🎭 **Role-Based Gameplay** - Hackers vs Impostor mechanics
- ⚡ **Real-Time Sync** - Host-authoritative state management

---

## 🚀 Quick Start

### Play Online

Visit [neuro-link.replit.app](https://neuro-link.replit.app) to start playing immediately!

### Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/neuro-link.git
cd neuro-link

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5000`

### Deploy on Replit

[![Run on Replit](https://replit.com/badge/github/yourusername/neuro-link)](https://replit.com/github/yourusername/neuro-link)

1. Click the button above or visit [replit.com/github](https://replit.com/github)
2. Import this repository
3. Click "Run" to start the server
4. Share the URL with your friends to play!

---

## 🎯 How to Play

### Setup (2-8 Players)

1. **Create a Room** - One player hosts and shares the room code or QR code
2. **Join the Lobby** - Other players join using the code
3. **Configure** - Host can enable "Play on Host" mode to participate
4. **Start Game** - Host initiates when ready

### Gameplay

1. **Role Reveal** - Each player sees their role:
   - **Hackers** 👨‍💻 - Know the secret word
   - **Impostor** 🕵️ - Don't know the word, must blend in

2. **Description Phase** - Players take turns (30s each) describing the word without saying it

3. **Voting** - After all turns, everyone votes for who they think is the impostor

4. **Victory Conditions**
   - **Hackers Win** - If they correctly identify the impostor
   - **Impostor Wins** - If they avoid detection

### Special Abilities

- **Noise Bomb** 💣 - Impostor can disrupt one player's turn (once per game)

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with custom cyberpunk theme
- **PeerJS** - WebRTC abstraction for P2P networking
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animations
- **QRCode.react** - QR code generation

### Backend
- **Express** - API server
- **Google Gemini API** - AI word generation
- **Web Audio API** - Sound synthesis
- **Vibration API** - Haptic feedback

### Build Tools
- **Vite** - Fast development and building
- **ESBuild** - Production bundling
- **TSX** - TypeScript execution

---

## 📁 Project Structure

```
neuro-link/
├── client/src/
│   ├── components/        # React components
│   │   ├── game/         # Game screens
│   │   └── ui/           # Reusable UI components
│   ├── lib/
│   │   ├── gameController.ts   # Main game orchestrator
│   │   ├── gameState.ts        # State management
│   │   ├── p2p.ts             # P2P networking
│   │   ├── gameMaster.ts      # Word generation
│   │   └── soundManager.ts    # Audio system
│   └── data/
│       └── fallbackWords.ts   # Offline word database
├── server/
│   ├── routes.ts         # API endpoints
│   └── app.ts           # Express server
└── shared/
    └── schema.ts        # Shared types
```

---

## 🎨 Design Philosophy

The game embraces a **retro-futuristic hacker terminal aesthetic**:

- **Color Palette**: Black background with neon cyan, purple, and green accents
- **Typography**: JetBrains Mono monospace for that terminal feel
- **Effects**: CRT scan lines, glitch animations, text glow
- **Audio**: Web Audio API synthesized bleeps and bloops
- **Interaction**: Haptic feedback on mobile devices

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Optional: Google Gemini API key for dynamic word generation
GEMINI_API_KEY=your_api_key_here

# Express session secret
SESSION_SECRET=your_random_secret_here
```

> **Note**: The game works perfectly without the Gemini API key using the built-in fallback word database.

### Game Settings

- **Player Count**: 2-8 players recommended
- **Turn Duration**: 30 seconds per player
- **Role Distribution**: 1 impostor, rest are hackers
- **Network**: Requires local network or public internet for P2P

---

## 📱 Mobile Support

The game is fully optimized for mobile devices:

- ✅ Responsive touch controls
- ✅ Haptic feedback on supported devices
- ✅ Screen wake lock during gameplay
- ✅ QR code scanning for easy room joining
- ✅ PWA support for "Add to Home Screen"

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Maintain the cyberpunk aesthetic
- Test on both desktop and mobile
- Update documentation as needed

---

## 🐛 Known Limitations

- P2P requires all players on the same local network or public internet
- Relies on PeerJS cloud signaling server
- No game state persistence (reloading page loses state)
- Maximum recommended: 8-10 players per room

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by classic social deduction games like Mafia and Spyfall
- Built with ❤️ using modern web technologies
- Cyberpunk aesthetic inspired by retro terminal interfaces
- PeerJS for making P2P networking accessible

---

## 📞 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/yourusername/neuro-link/issues)
- 💡 **Feature Requests**: [Open an issue](https://github.com/yourusername/neuro-link/issues)
- 💬 **Questions**: Check existing issues or open a new one

---

<div align="center">

**Made with 💚 by the NEURO-LINK team**

[⬆ Back to Top](#neuro-link-protocol-zero)

</div>
