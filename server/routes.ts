import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/config', (req, res) => {
    res.json({
      geminiApiKey: process.env.GEMINI_API_KEY || ''
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
