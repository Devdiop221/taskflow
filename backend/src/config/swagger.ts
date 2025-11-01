import swaggerJsdoc from "swagger-jsdoc";
import { SwaggerDefinition } from "swagger-jsdoc";

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "TaskFlow API",
    version: "1.0.0",
    description: "API multi-tenant pour la gestion de projets et de tâches",
    contact: {
      name: "TaskFlow Team",
      email: "support@taskflow.com",
    },
  },
  servers: [
    {
      url: process.env.API_URL || "http://localhost:8000",
      description: "Serveur de développement",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Entrez votre token JWT (sans 'Bearer ' devant). Exemple: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "x-tokenName": "Authorization",
      },
      BearerAuth: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
        description: "Entrez 'Bearer ' suivi de votre token JWT. Exemple: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Identifiant unique de l'utilisateur",
          },
          email: {
            type: "string",
            format: "email",
            description: "Adresse email de l'utilisateur",
          },
          name: {
            type: "string",
            description: "Nom complet de l'utilisateur",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Date de création du compte",
          },
        },
      },
      Organization: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Identifiant unique de l'organisation",
          },
          name: {
            type: "string",
            description: "Nom de l'organisation",
          },
          slug: {
            type: "string",
            description: "Slug unique de l'organisation",
          },
          ownerId: {
            type: "string",
            description: "ID du propriétaire de l'organisation",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Date de création de l'organisation",
          },
          members: {
            type: "array",
            items: {
              $ref: "#/components/schemas/OrganizationMember",
            },
          },
        },
      },
      OrganizationMember: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Identifiant unique du membre",
          },
          role: {
            type: "string",
            enum: ["OWNER", "ADMIN", "MEMBER"],
            description: "Rôle du membre dans l'organisation",
          },
          userId: {
            type: "string",
            description: "ID de l'utilisateur",
          },
          organizationId: {
            type: "string",
            description: "ID de l'organisation",
          },
          joinedAt: {
            type: "string",
            format: "date-time",
            description: "Date d'adhésion à l'organisation",
          },
          user: {
            $ref: "#/components/schemas/User",
          },
        },
      },
      Project: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Identifiant unique du projet",
          },
          name: {
            type: "string",
            description: "Nom du projet",
          },
          description: {
            type: "string",
            nullable: true,
            description: "Description du projet",
          },
          status: {
            type: "string",
            enum: ["ACTIVE", "ARCHIVED", "COMPLETED"],
            description: "Statut du projet",
          },
          organizationId: {
            type: "string",
            description: "ID de l'organisation propriétaire",
          },
          creatorId: {
            type: "string",
            description: "ID du créateur du projet",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Date de création du projet",
          },
          creator: {
            $ref: "#/components/schemas/User",
          },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Identifiant unique de la tâche",
          },
          title: {
            type: "string",
            description: "Titre de la tâche",
          },
          description: {
            type: "string",
            nullable: true,
            description: "Description de la tâche",
          },
          status: {
            type: "string",
            enum: ["TODO", "IN_PROGRESS", "DONE"],
            description: "Statut de la tâche",
          },
          priority: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
            description: "Priorité de la tâche",
          },
          projectId: {
            type: "string",
            description: "ID du projet parent",
          },
          assigneeId: {
            type: "string",
            nullable: true,
            description: "ID de l'utilisateur assigné",
          },
          creatorId: {
            type: "string",
            description: "ID du créateur de la tâche",
          },
          dueDate: {
            type: "string",
            format: "date-time",
            nullable: true,
            description: "Date d'échéance de la tâche",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Date de création de la tâche",
          },
          assignee: {
            $ref: "#/components/schemas/User",
          },
          creator: {
            $ref: "#/components/schemas/User",
          },
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Indique si la requête a réussi",
          },
          data: {
            type: "object",
            description: "Données de la réponse",
          },
          message: {
            type: "string",
            description: "Message descriptif",
          },
          error: {
            type: "string",
            description: "Message d'erreur si applicable",
          },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "string",
            example: "Validation error",
          },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
                message: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    "./src/routes/*.ts",
    "./src/controllers/*.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);