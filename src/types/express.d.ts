import { Role, Habilitation } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      agent?: {
        id: string;
        role: Role;
        habilitation: Habilitation;
      };
    }
  }
}
export function json(): any {
    throw new Error('Function not implemented.');
}

