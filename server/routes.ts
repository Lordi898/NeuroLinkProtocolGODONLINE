import type { Express } from "express";
import { createServer, type Server } from "http";
import { GoogleGenAI } from '@google/genai';

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

export async function registerRoutes(app: Express): Promise<Server> {
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
