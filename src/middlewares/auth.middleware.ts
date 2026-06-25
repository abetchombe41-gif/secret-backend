import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role, Habilitation } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

interface TokenPayload {
  id: string;
  role: Role;
  habilitation: Habilitation;
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: "Accès refusé. Token absent." });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.agent = {
      id: decoded.id,
      role: decoded.role,
      habilitation: decoded.habilitation
    };
    next();
  } catch (error) {
    res.status(401).json({ error: "Accès refusé. Token invalide ou expiré." });
  }
};

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.agent) {
      res.status(401).json({ error: "Non authentifié." });
      return;
    }

    // Ajout du point d'exclamation (!) pour confirmer à TypeScript que agent existe
    if (!allowedRoles.includes(req.agent!.role)) {
      res.status(403).json({ error: "Interdit. Droits insuffisants pour cette action." });
      return;
    }

    next();
  };
};

