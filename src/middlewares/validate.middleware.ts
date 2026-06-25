import { Request, Response, NextFunction } from 'express';

export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { username, password } = req.body;
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    res.status(400).json({ error: "Format invalide. Le nom d'agent doit contenir au moins 3 caractères." });
    return;
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ error: "Sécurité insuffisante. Le mot de passe requiert au moins 6 caractères." });
    return;
  }
  next();
};
