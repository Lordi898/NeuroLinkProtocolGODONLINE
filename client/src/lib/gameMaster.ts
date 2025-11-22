import { GoogleGenAI } from '@google/genai';
import { getRandomWord, type WordData } from '@/data/fallbackWords';

export async function generateSecretWord(apiKey?: string): Promise<WordData> {
  if (!apiKey || apiKey.trim() === '') {
    console.log('[GAME MASTER] No API key provided, using fallback words');
    return getLocalSecretWord();
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const prompt = `Generate a single random word suitable for a social deduction game. The word should be:
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
    console.error('[GAME MASTER] Gemini API failed, falling back to local words:', error);
    return getLocalSecretWord();
  }
}

export function getLocalSecretWord(): WordData {
  return getRandomWord();
}
