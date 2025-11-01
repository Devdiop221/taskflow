import { Router } from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller";
import { authenticate } from "../middleware/auth";
import { verifyTenant } from "../middleware/tenancy";

const router = Router({ mergeParams: true });

// All routes require authentication and tenant verification
router.use(authenticate);
router.use(verifyTenant);

/**
 * @swagger
 * /api/organizations/{organizationId}/projects:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Créer un nouveau projet
 *     description: Crée un nouveau projet dans l'organisation spécifiée
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'organisation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Nom du projet
 *                 example: "Site Web E-commerce"
 *               description:
 *                 type: string
 *                 description: Description du projet
 *                 example: "Développement d'un site e-commerce avec React et Node.js"
 *     responses:
 *       201:
 *         description: Projet créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *                 message:
 *                   type: string
 *                   example: "Project created successfully"
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *   get:
 *     tags:
 *       - Projects
 *     summary: Lister les projets de l'organisation
 *     description: Récupère tous les projets de l'organisation avec filtrage optionnel par statut
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'organisation
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["ACTIVE", "ARCHIVED", "COMPLETED"]
 *         description: Filtrer par statut de projet
 *     responses:
 *       200:
 *         description: Liste des projets récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 */
router.post("/", createProject);
router.get("/", getProjects);

/**
 * @swagger
 * /api/organizations/{organizationId}/projects/{projectId}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Détails d'un projet
 *     description: Récupère les détails complets d'un projet avec ses tâches
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'organisation
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du projet
 *     responses:
 *       200:
 *         description: Détails du projet récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   allOf:
 *                     - $ref: '#/components/schemas/Project'
 *                     - type: object
 *                       properties:
 *                         tasks:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Task'
 *       404:
 *         description: Projet non trouvé
 *   patch:
 *     tags:
 *       - Projects
 *     summary: Mettre à jour un projet
 *     description: Met à jour les informations d'un projet existant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'organisation
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du projet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Nouveau nom du projet
 *               description:
 *                 type: string
 *                 description: Nouvelle description du projet
 *               status:
 *                 type: string
 *                 enum: ["ACTIVE", "ARCHIVED", "COMPLETED"]
 *                 description: Nouveau statut du projet
 *     responses:
 *       200:
 *         description: Projet mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *                 message:
 *                   type: string
 *                   example: "Project updated successfully"
 *       404:
 *         description: Projet non trouvé
 *   delete:
 *     tags:
 *       - Projects
 *     summary: Supprimer un projet
 *     description: Supprime définitivement un projet et toutes ses tâches
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'organisation
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du projet
 *     responses:
 *       200:
 *         description: Projet supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Project deleted successfully"
 *       404:
 *         description: Projet non trouvé
 */
router.get("/:projectId", getProject);
router.patch("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);

export default router;
