import { Router } from "express";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";
import { authenticate } from "../middleware/auth";
import { verifyTenant } from "../middleware/tenancy";

const router = Router({ mergeParams: true });

// All routes require authentication and tenant verification
router.use(authenticate);
router.use(verifyTenant);

/**
 * @swagger
 * /api/organizations/{organizationId}/projects/{projectId}/tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Créer une nouvelle tâche
 *     description: Crée une nouvelle tâche dans le projet spécifié
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
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 description: Titre de la tâche
 *                 example: "Implémenter l'authentification"
 *               description:
 *                 type: string
 *                 description: Description détaillée de la tâche
 *                 example: "Mettre en place le système d'authentification JWT avec middleware"
 *               priority:
 *                 type: string
 *                 enum: ["LOW", "MEDIUM", "HIGH", "URGENT"]
 *                 description: Priorité de la tâche
 *                 example: "HIGH"
 *               assigneeId:
 *                 type: string
 *                 description: ID de l'utilisateur assigné à la tâche
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date d'échéance de la tâche
 *                 example: "2024-12-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Tâche créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *                   example: "Task created successfully"
 *       400:
 *         description: Erreur de validation ou assigné non membre
 *       404:
 *         description: Projet non trouvé
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Lister les tâches du projet
 *     description: Récupère toutes les tâches du projet avec filtrage optionnel
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["TODO", "IN_PROGRESS", "DONE"]
 *         description: Filtrer par statut de tâche
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: ["LOW", "MEDIUM", "HIGH", "URGENT"]
 *         description: Filtrer par priorité
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *         description: Filtrer par utilisateur assigné
 *     responses:
 *       200:
 *         description: Liste des tâches récupérée avec succès
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
 *                     $ref: '#/components/schemas/Task'
 *       404:
 *         description: Projet non trouvé
 */
router.post("/", createTask);
router.get("/", getTasks);

/**
 * @swagger
 * /api/organizations/{organizationId}/projects/{projectId}/tasks/{taskId}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Détails d'une tâche
 *     description: Récupère les détails complets d'une tâche spécifique
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
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tâche
 *     responses:
 *       200:
 *         description: Détails de la tâche récupérés avec succès
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
 *                     - $ref: '#/components/schemas/Task'
 *                     - type: object
 *                       properties:
 *                         project:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *       404:
 *         description: Tâche non trouvée
 *   patch:
 *     tags:
 *       - Tasks
 *     summary: Mettre à jour une tâche
 *     description: Met à jour les informations d'une tâche existante
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
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tâche
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 description: Nouveau titre de la tâche
 *               description:
 *                 type: string
 *                 description: Nouvelle description de la tâche
 *               status:
 *                 type: string
 *                 enum: ["TODO", "IN_PROGRESS", "DONE"]
 *                 description: Nouveau statut de la tâche
 *               priority:
 *                 type: string
 *                 enum: ["LOW", "MEDIUM", "HIGH", "URGENT"]
 *                 description: Nouvelle priorité de la tâche
 *               assigneeId:
 *                 type: string
 *                 description: Nouvel utilisateur assigné
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Nouvelle date d'échéance
 *     responses:
 *       200:
 *         description: Tâche mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 message:
 *                   type: string
 *                   example: "Task updated successfully"
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Tâche non trouvée
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Supprimer une tâche
 *     description: Supprime définitivement une tâche
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
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tâche
 *     responses:
 *       200:
 *         description: Tâche supprimée avec succès
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
 *                   example: "Task deleted successfully"
 *       404:
 *         description: Tâche non trouvée
 */
router.get("/:taskId", getTask);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
