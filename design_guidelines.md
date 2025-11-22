# NEURO-LINK: Protocol Zero - Design Guidelines

## Design Approach
**Cyberpunk Terminal Aesthetic** - A retro-futuristic hacker interface with CRT screen effects, monospaced typography, and neon accents. Think 1980s command-line terminals merged with modern social deduction gameplay.

---

## Typography System

**Primary Font:** JetBrains Mono or Share Tech Mono (Google Fonts)
- All text: UPPERCASE, monospaced
- Headings: Bold weight, larger tracking
- Body: Regular weight, readable line-height for mobile
- Code-style elements: Use `<code>` tags for emphasis

---

## Color Palette

**Background:** `#050505` (Void Black) with subtle CSS grid overlay
**Primary Accents:**
- Neon Green `#0f0` - Hackers, active states, success
- Neon Red `#f00` - Impostor, danger, errors  
- Neon Cyan `#0ff` - System messages, neutral info

**Effects:**
- `.text-glow` - Text-shadow using neon colors
- `.scanline` - Moving gradient overlay for CRT effect
- `.glitch-effect` - Keyframe clip-path animation

---

## Layout System

**Spacing:** Tailwind units 2, 4, 8, 16 for consistent rhythm

**Mobile (Client View):**
- Full-screen single-column layout
- Large touch targets (min 48px height)
- Impostor reveal: ENTIRE screen background turns red
- Bottom-fixed action buttons with glow effects

**Desktop (Host View):**
- Dashboard grid: QR code left, player list center, activity logs right
- Timer prominent at top-center
- Spectator-focused (public info only unless "Play on this device" toggled)

---

## Component Library

**NeonButton:** Rectangular with border glow, hover intensifies color
**GlitchText:** Animated text with shifting RGB offset
**Card:** Dark background `#0a0a0a`, 1px neon border, subtle scanline overlay
**Scanline:** Animated pseudo-element moving top-to-bottom
**PrivacyShield:** Click-to-reveal overlay with blur backdrop for host word display

**Game Phase Screens:**
- **Lobby:** QR code card, player list with signal strength bars (animated)
- **Role Reveal:** Full-screen "DECRYPTING..." progress bar, then word/error display
- **Gameplay:** Active player glows green border, 15s countdown timer, "Noise Bomb" button (Impostor only)
- **Voting:** Grid of player cards, click to vote, results with elimination animation
- **Game Over:** Winner announcement with particle effects

---

## Animations

**Scanline:** Continuous 2s vertical loop
**Glitch:** Trigger on critical events (role reveal, impostor ability)
**Shake:** 0.3s horizontal vibration on Noise Bomb
**Glow Pulse:** 1.5s ease-in-out on active player/buttons
**Progress Bars:** Linear fill with neon trail effect

---

## Images

**No hero images.** This is a game interface, not a marketing site. All visuals are UI-generated (QR codes, player avatars as initials in circles, geometric patterns).

---

## Special Interactions

- **Vibration API:** 200ms pulse on game events (mobile only)
- **Screen Wake Lock:** Active during gameplay to prevent sleep
- **Synthesized Audio:** Web Audio API oscillators (no external files)
  - Connect: High sine wave beep
  - Glitch: Sawtooth noise burst  
  - Timer: Low square wave tick

---

## Accessibility

- High contrast neon on black meets WCAG AA
- All interactive elements have visible focus states (neon outline)
- Screen reader labels for game state changes
- Touch targets 48px minimum on mobile

---

## PWA Configuration

Include `manifest.json` with:
- App name: "NEURO-LINK: Protocol Zero"
- Theme color: `#0f0`
- Display: fullscreen
- Icons: Generate simple geometric neon logo (green circuit pattern)