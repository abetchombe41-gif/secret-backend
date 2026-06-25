import { Router } from 'express';
import { prisma } from '../config/db.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import { getAccessibleHabilitations } from '../utils/clearance.js';
import { actionLogger } from '../middlewares/logger.middleware.js';
import { StatutMission } from '@prisma/client';

const router = Router();

// Lecture des missions avec filtrage, pagination et habilitation (Mission 4 & Bonus)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const clearanceList = getAccessibleHabilitations(req.agent!.habilitation);
    
    const { statut, page = '1', limit = '5' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const queryFilters: any = {
      confidentialite: { in: clearanceList }
    };

    if (statut && Object.values(StatutMission).includes(statut as StatutMission)) {
      queryFilters.statut = statut;
    }

    const [missions, totalCount] = await prisma.$transaction([
      prisma.mission.findMany({
        where: queryFilters,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.mission.count({ where: queryFilters })
    ]);

    res.json({
      metadata: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      },
      missions
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur de décryptage des missions." });
  }
});

// Création réservée au CHEF (Mission 4)
router.post('/', authenticateJWT, authorizeRoles('CHEF'), actionLogger, async (req, res) => {
  try {
    const { titre, description, confidentialite, recompense } = req.body;
    
    if (!titre || !description) {
      res.status(400).json({ error: "Données de la mission incomplètes." });
      return;
    }

    const mission = await prisma.mission.create({
      data: {
        titre,
        description,
        confidentialite,
        recompense: Number(recompense)
      }
    });

    res.status(201).json(mission);
  } catch (error) {
    res.status(400).json({ error: "Création impossible. Paramètres erronés." });
  }
});

// Suppression réservée au CHEF (Mission 4)
router.delete('/:id', authenticateJWT, authorizeRoles('CHEF'), actionLogger, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.mission.delete({ where: { id } });
    res.json({ message: "Mission neutralisée et effacée." });
  } catch (error) {
    res.status(404).json({ error: "Mission introuvable dans les archives." });
  }
});

export default router;
