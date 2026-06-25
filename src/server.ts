import 'dotenv/config';
import express, { Request, Response } from 'express';
import authRoutes from './routes/auth.routes.js';
import missionRoutes from './routes/mission.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes principales de l'Agence
app.use('/api/auth', authRoutes);
app.use('/api/missions', missionRoutes);

// Gestion globale des routes inconnues (Mission 5)
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Ressource introuvable dans le périmètre du QG." });
});

app.listen(PORT, () => {
  console.log(`🚀 [S.P.I.O.N. BACKEND LIVE] Operational on port ${PORT}`);
});

