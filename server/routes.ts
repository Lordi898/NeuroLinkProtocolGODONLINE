import type { Express } from "express";
import { createServer, type Server } from "http";
import { GoogleGenAI } from '@google/genai';
import { loginUser, registerUser } from './auth';
import { storage } from './storage';

interface WordData {
  word: string;
  category: string;
}

const fallbackWords: WordData[] = [
  { word: "LAPTOP", category: "TECHNOLOGY" },
  { word: "PIZZA", category: "FOOD" },
  { word: "DOCTOR", category: "PROFESSION" },
  { word: "LIBRARY", category: "LOCATION" },
  { word: "MOTORCYCLE", category: "VEHICLE" },
  { word: "ELEPHANT", category: "ANIMAL" },
  { word: "GUITAR", category: "OBJECT" },
  { word: "SMARTPHONE", category: "TECHNOLOGY" },
  { word: "SUSHI", category: "FOOD" },
  { word: "TEACHER", category: "PROFESSION" },
  { word: "AIRPORT", category: "LOCATION" },
  { word: "SUBMARINE", category: "VEHICLE" },
  { word: "PENGUIN", category: "ANIMAL" },
  { word: "CAMERA", category: "OBJECT" },
  { word: "HEADPHONES", category: "TECHNOLOGY" },
  { word: "BURGER", category: "FOOD" },
  { word: "CHEF", category: "PROFESSION" },
  { word: "MUSEUM", category: "LOCATION" },
  { word: "HELICOPTER", category: "VEHICLE" },
  { word: "DOLPHIN", category: "ANIMAL" }
];

function getRandomFallbackWord(language: string = 'en'): WordData {
  const words = language === 'es' ? fallbackWordsES : fallbackWords;
  return words[Math.floor(Math.random() * words.length)];
}

const fallbackWordsES: WordData[] = [
  { word: "DRON", category: "TECNOLOGÍA" },
  { word: "CORTAFUEGOS", category: "TECNOLOGÍA" },
  { word: "ORDENADOR PORTÁTIL", category: "TECNOLOGÍA" },
  { word: "PIZZA", category: "COMIDA" },
  { word: "SUSHI", category: "COMIDA" },
  { word: "ASTRONAUTA", category: "PROFESIÓN" },
  { word: "DETECTIVE", category: "PROFESIÓN" },
  { word: "PARÍS", category: "UBICACIÓN" },
  { word: "TOKIO", category: "UBICACIÓN" },
  { word: "MOTOCICLETA", category: "VEHÍCULO" },
  { word: "HELICÓPTERO", category: "VEHÍCULO" },
  { word: "UNICORNIO", category: "ANIMAL" },
  { word: "DRAGÓN", category: "ANIMAL" },
  { word: "GUITARRA", category: "INSTRUMENTO" },
  { word: "SINTETIZADOR", category: "INSTRUMENTO" },
  { word: "HACKEO", category: "ACTIVIDAD" },
  { word: "PARKOUR", category: "ACTIVIDAD" },
  { word: "INVISIBILIDAD", category: "SUPERPODER" },
  { word: "TELETRANSPORTACIÓN", category: "SUPERPODER" },
  { word: "AURICULARES", category: "OBJETO" }
];

async function generateWordWithGemini(language: string = 'en'): Promise<WordData> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.trim() === '') {
    console.log('[SERVER] No Gemini API key, using fallback');
    return getRandomFallbackWord(language);
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const isSpanish = language === 'es';
    const prompt = isSpanish 
      ? `Genera una palabra aleatoria adecuada para un juego de deducción social. La palabra debe ser:
- Un sustantivo concreto (no abstracto)
- Fácil de describir sin decirla directamente
- Suficientemente común para que la mayoría la conozca
- Una o dos palabras máximo
- De categorías como: tecnología, comida, profesiones, ubicaciones, vehículos, animales, objetos

Responde SOLO con la palabra en MAYÚSCULAS, seguida de un carácter de barra vertical, luego la categoría en MAYÚSCULAS.
Formato de ejemplo: PIZZA|COMIDA
No incluyas ningún otro texto.`
      : `Generate a single random word suitable for a social deduction game. The word should be:
- A concrete noun (not abstract)
- Easy to describe without saying it directly
- Common enough that most people know it
- One or two words maximum
- From categories like: technology, food, professions, locations, vehicles, animals, objects

Respond ONLY with the word in UPPERCASE, followed by a pipe character, then the category in UPPERCASE.
Example format: PIZZA|FOOD
Do not include any other text.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt
    });
    const text = result.text?.trim() || '';
    
    const parts = text.split('|');
    if (parts.length === 2) {
      return {
        word: parts[0].trim().toUpperCase(),
        category: parts[1].trim().toUpperCase()
      };
    } else {
      throw new Error('Invalid response format from Gemini');
    }
  } catch (error) {
    console.error('[SERVER] Gemini API failed, using fallback:', error);
    return getRandomFallbackWord();
  }
}

// Rate limiting middleware
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 900000): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  
  if (!attempt || now > attempt.resetTime) {
    loginAttempts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (attempt.count < maxAttempts) {
    attempt.count++;
    return true;
  }
  
  return false;
}

// Security headers middleware
function addSecurityHeaders(req: any, res: any, next: any) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply security headers
  app.use(addSecurityHeaders);

  // Auth Routes with rate limiting
  app.post('/api/auth/login', async (req, res) => {
    try {
      const clientIp = req.ip || 'unknown';
      if (!checkRateLimit(`login:${clientIp}`, 5, 900000)) {
        return res.status(429).json({ message: 'AUTH_FAILED' });
      }

      const { username, password } = req.body;
      if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'AUTH_FAILED' });
      }

      const user = await loginUser(username, password);
      res.json(user);
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      res.status(401).json({ message: 'AUTH_FAILED' });
    }
  });

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const clientIp = req.ip || 'unknown';
      if (!checkRateLimit(`signup:${clientIp}`, 3, 900000)) {
        return res.status(429).json({ message: 'AUTH_FAILED' });
      }

      const { username, password } = req.body;
      if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'AUTH_FAILED' });
      }

      const user = await registerUser(username, password);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('[AUTH] Signup error:', error);
      res.status(400).json({ message: 'AUTH_FAILED' });
    }
  });

  // Leaderboard Routes with input validation
  app.get('/api/leaderboard/wins', async (req, res) => {
    try {
      const limit = Math.max(1, Math.min(parseInt(req.query.limit as string) || 10, 100));
      if (!Number.isInteger(limit)) throw new Error('Invalid limit');
      const leaderboard = await storage.getLeaderboardByWins(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error('[LEADERBOARD] Error:', error);
      res.status(400).json({ message: 'ERROR' });
    }
  });

  app.get('/api/leaderboard/impostor-wins', async (req, res) => {
    try {
      const limit = Math.max(1, Math.min(parseInt(req.query.limit as string) || 10, 100));
      if (!Number.isInteger(limit)) throw new Error('Invalid limit');
      const leaderboard = await storage.getLeaderboardByImpostorWins(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error('[LEADERBOARD] Error:', error);
      res.status(400).json({ message: 'ERROR' });
    }
  });

  // Match History Route with validation
  app.get('/api/users/:userId/matches', async (req, res) => {
    try {
      const { userId } = req.params;
      if (typeof userId !== 'string' || userId.length < 1 || userId.length > 100) {
        return res.status(400).json({ message: 'ERROR' });
      }
      const limit = Math.max(1, Math.min(parseInt(req.query.limit as string) || 10, 50));
      if (!Number.isInteger(limit)) throw new Error('Invalid limit');
      const matches = await storage.getUserMatches(userId, limit);
      res.json(matches);
    } catch (error) {
      console.error('[MATCHES] Error:', error);
      res.status(400).json({ message: 'ERROR' });
    }
  });

  // Friends Routes with validation
  app.post('/api/friends/add', async (req, res) => {
    try {
      const { userId, friendId } = req.body;
      if (typeof userId !== 'string' || typeof friendId !== 'string' || userId.length < 1 || friendId.length < 1) {
        return res.status(400).json({ message: 'ERROR' });
      }
      if (userId === friendId) return res.status(400).json({ message: 'ERROR' });
      const friend = await storage.addFriend(userId, friendId);
      res.json(friend);
    } catch (error) {
      console.error('[FRIENDS] Error:', error);
      res.status(400).json({ message: 'ERROR' });
    }
  });

  app.get('/api/friends/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      if (typeof userId !== 'string' || userId.length < 1 || userId.length > 100) {
        return res.status(400).json({ message: 'ERROR' });
      }
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error('[FRIENDS] Error:', error);
      res.status(400).json({ message: 'ERROR' });
    }
  });

  app.post('/api/generate-word', async (req, res) => {
    try {
      const { language = 'en' } = req.body;
      const wordData = await generateWordWithGemini(language);
      res.json(wordData);
    } catch (error) {
      console.error('[SERVER] Word generation error:', error);
      const { language = 'en' } = req.body;
      res.json(getRandomFallbackWord(language));
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
