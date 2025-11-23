/**
 * Input Validation & Sanitization Module
 * Prevents XSS, injection attacks, rate limiting, and malicious data
 */

const MAX_MESSAGE_LENGTH = 200;
const MAX_CLUE_LENGTH = 500;
const MAX_PLAYER_NAME_LENGTH = 30;
const RATE_LIMIT_WINDOW = 1000; // 1 second
const RATE_LIMIT_MAX_MESSAGES = 5; // 5 messages per second

// Rate limiting tracker: playerId -> timestamps of last messages
const messageRateLimits = new Map<string, number[]>();
const voteRateLimits = new Map<string, number>();

export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .trim()
    .substring(0, MAX_MESSAGE_LENGTH)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizePlayerName(name: string): string {
  if (!name || typeof name !== 'string') return 'PLAYER';
  
  return name
    .trim()
    .substring(0, MAX_PLAYER_NAME_LENGTH)
    .toUpperCase()
    .replace(/[^A-Z0-9-_]/g, '');
}

export function sanitizeClue(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .trim()
    .substring(0, MAX_CLUE_LENGTH)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function checkMessageRateLimit(playerId: string): boolean {
  const now = Date.now();
  const userLimits = messageRateLimits.get(playerId) || [];
  
  // Filter out old timestamps
  const recentTimestamps = userLimits.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  
  if (recentTimestamps.length >= RATE_LIMIT_MAX_MESSAGES) {
    return false; // Rate limited
  }
  
  recentTimestamps.push(now);
  messageRateLimits.set(playerId, recentTimestamps);
  return true;
}

export function checkVoteRateLimit(playerId: string): boolean {
  const now = Date.now();
  const lastVote = voteRateLimits.get(playerId) || 0;
  
  // Only allow 1 vote per second minimum
  if (now - lastVote < 500) {
    return false;
  }
  
  voteRateLimits.set(playerId, now);
  return true;
}

export function validatePlayerId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id.length < 100;
}

export function validateMessageContent(text: string, secretWord?: string): boolean {
  if (!text || typeof text !== 'string') return false;
  if (text.length < 1 || text.length > MAX_MESSAGE_LENGTH) return false;
  
  // Check if contains secret word
  if (secretWord) {
    const lower = text.toLowerCase();
    const secretLower = secretWord.toLowerCase();
    if (lower.includes(secretLower)) return false;
  }
  
  return true;
}

export function validateClueContent(text: string, secretWord?: string): boolean {
  if (!text || typeof text !== 'string') return false;
  if (text.length < 1 || text.length > MAX_CLUE_LENGTH) return false;
  
  // Check if contains secret word
  if (secretWord) {
    const lower = text.toLowerCase();
    const secretLower = secretWord.toLowerCase();
    if (lower.includes(secretLower)) return false;
  }
  
  return true;
}

export function clearRateLimits(): void {
  messageRateLimits.clear();
  voteRateLimits.clear();
}
