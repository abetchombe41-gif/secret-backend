import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { prisma } from '../config/db.js';
import { validateRegistration } from '../middlewares/validate.middleware.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingAgent = await prisma.agent.findUnique({ where: { username } });
    if (existingAgent) {
      res.status(400).json({ error: "Identifiant compromis. Déjà utilisé." });
      return;
    }

    // Gestion du rôle secret via Header
    let targetRole: 'AGENT' | 'CHEF' = 'AGENT';
    let targetHabilitation: 'CONFIDENTIEL' | 'TRES_SECRET' = 'CONFIDENTIEL';
    
    if (req.headers['x-spy-admin-secret'] === process.env.ADMIN_REGISTRATION_SECRET) {
      targetRole = 'CHEF';
      targetHabilitation = 'TRES_SECRET';
    }

    // Mission 2: Récupération de l'identité de couverture via Axios
    let couverture = { nom: "Inconnu", nationalite: "FR", photo: "" };
    try {
      const response = await axios.get('https://randomuser.me', { timeout: 4000 });
      const user = response.data.results[0];
      couverture = {
        nom: `${user.name.first} ${user.name.last}`,
        nationalite: user.nat,
        photo: user.picture.medium
      };
    } catch (networkError) {
      console.error("⚠️ Échec de liaison avec le serveur de couverture externe. Utilisation d'un profil générique.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = await prisma.agent.create({
      data: {
        username,
        password: hashedPassword,
        role: targetRole,
        habilitation: targetHabilitation,
        nomCouverture: couverture.nom,
        nationalite: couverture.nationalite,
        photo: couverture.photo
      }
    });

    res.status(201).json({
      message: "Agent recruté sous couverture.",
      agent: {
        id: newAgent.id,
        username: newAgent.username,
        role: newAgent.role,
        habilitation: newAgent.habilitation,
        couverture: { nom: newAgent.nomCouverture, nat: newAgent.nationalite }
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Échec critique lors du recrutement." });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Contre-espionnage: Message générique en cas d'erreur
    const genericError = "Identifiants invalides. Accès refusé.";

    const agent = await prisma.agent.findUnique({ where: { username } });
    if (!agent) {
      res.status(401).json({ error: genericError });
      return;
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      res.status(401).json({ error: genericError });
      return;
    }

    const token = jwt.sign(
      { id: agent.id, role: agent.role, habilitation: agent.habilitation },
      JWT_SECRET,
      { expiresIn: '15m' } // Expiration courte (Bonus)
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erreur technique d'authentification." });
  }
});

// Route Profil Connecté (Bonus)
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const currentAgent = await prisma.agent.findUnique({
      where: { id: req.agent!.id },
      select: {
        id: true,
        username: true,
        role: true,
        habilitation: true,
        nomCouverture: true,
        nationalite: true,
        photo: true
      }
    });
    res.json(currentAgent);
  } catch (error) {
    res.status(500).json({ error: "Impossible de lire le profil." });
  }
});

export default router;
