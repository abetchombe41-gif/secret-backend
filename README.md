# 🕵️‍♂️ Opération : Backend Secret - Agence S.P.I.O.N.

## 👥 Cellule Tactique
- Agent **[Abé Tchombé Bruno Dimitri]**
- Agent **[Duvers, Nerkesly]**

## Lien Github
https://github.com/abetchombe41-gif/secret-backend

## 💻 Déploiement Rapide
1. Installer l'environnement : `npm install`
2. Configurer la liaison cloud Neon au sein du fichier `.env`.
3. Appliquer la structure de base : `npx prisma migrate dev --name init`
4. Lancer les réacteurs : `npm run dev`

## 📊 Validation & Persistance
Utilisez le fichier `api-test.http` intégré. Pour prouver la persistance, créez une mission via l'étape 8, redémarrez votre serveur à chaud, puis relancez l'étape 9. Les données restent gravées dans l'instance Neon PostgreSQL.
