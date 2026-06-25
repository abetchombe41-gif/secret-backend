import { Request, Response, NextFunction } from 'express';

export const actionLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🔍 ALERTE SÉCURITÉ - Requête vers ${req.method} ${req.originalUrl}`);
  next();
};
