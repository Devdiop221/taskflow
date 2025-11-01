import { Router } from "express";
import {
  createOrganization,
  getUserOrganizations,
  getOrganization,
  inviteMember,
  removeMember,
} from "../controllers/organization.controller";
import { authenticate } from "../middleware/auth";
import { verifyTenant, requireRole } from "../middleware/tenancy";
import { Role } from "@prisma/client";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Créer une nouvelle organisation
 *     description: Crée une nouvelle organisation avec l'utilisateur connecté comme propriétaire
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Nom de l'organisation
 *                 example: "Mon Entreprise"
 *               slug:
 *                 type: string
 *                 minLength: 3
 *                 pattern: "^[a-z0-9-]+$"
 *                 description: Slug unique de l'organisation (lettres minuscules, chiffres et tirets)
 *                 example: "mon-entreprise"
 *     responses:
 *       201:
 *         description: Organisation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Organization'
 *                 message:
 *                   type: string
 *                   example: "Organization created successfully"
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Slug déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Organization slug already taken"
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Lister les organisations de l'utilisateur
 *     description: Récupère toutes les organisations dont l'utilisateur est membre
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des organisations récupérée avec succès
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: ["OWNER", "ADMIN", "MEMBER"]
 *                       memberCount:
 *                         type: number
 *                       projectCount:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.post("/", createOrganization);
router.get("/", getUserOrganizations);

/**
 * @swagger
 * /api/organizations/{organizationId}:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Détails d'une organisation
 *     description: Récupère les détails complets d'une organisation (membres uniquement)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'organisation
 *     responses:
 *       200:
 *         description: Détails de l'organisation récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Organization'
 *       403:
 *         description: Accès refusé (pas membre de l'organisation)
 *       404:
 *         description: Organisation non trouvée
 */
router.get("/:organizationId", verifyTenant, getOrganization);

/**
 * @swagger
 * /api/organizations/{organizationId}/members:
 *   post:
 *     tags:
 *       - Organizations
 *     summary: Inviter un membre
 *     description: Invite un utilisateur à rejoindre l'organisation (Admin/Owner uniquement)
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
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email de l'utilisateur à inviter
 *                 example: "nouveau@example.com"
 *               role:
 *                 type: string
 *                 enum: ["ADMIN", "MEMBER"]
 *                 description: Rôle à attribuer au nouveau membre
 *                 example: "MEMBER"
 *     responses:
 *       201:
 *         description: Membre ajouté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/OrganizationMember'
 *                 message:
 *                   type: string
 *                   example: "Member added successfully"
 *       403:
 *         description: Permissions insuffisantes
 *       404:
 *         description: Utilisateur non trouvé
 *       409:
 *         description: Utilisateur déjà membre
 */
router.post(
  "/:organizationId/members",
  verifyTenant,
  requireRole([Role.OWNER, Role.ADMIN]),
  inviteMember
);

/**
 * @swagger
 * /api/organizations/{organizationId}/members/{userId}:
 *   delete:
 *     tags:
 *       - Organizations
 *     summary: Supprimer un membre
 *     description: Retire un membre de l'organisation (Admin/Owner uniquement)
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
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur à supprimer
 *     responses:
 *       200:
 *         description: Membre supprimé avec succès
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
 *                   example: "Member removed successfully"
 *       400:
 *         description: Impossible de supprimer le propriétaire
 *       403:
 *         description: Permissions insuffisantes
 *       404:
 *         description: Membre non trouvé
 */
router.delete(
  "/:organizationId/members/:userId",
  verifyTenant,
  requireRole([Role.OWNER, Role.ADMIN]),
  removeMember
);

export default router;
