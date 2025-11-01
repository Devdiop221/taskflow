import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

// Import routes
import authRoutes from "./routes/auth.route";
import organizationRoutes from "./routes/organization.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";

// Import middleware and types
import { authenticate } from "./middleware/auth";
import { AuthRequest } from "./types";
import { prisma } from "./lib/prisma";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .auth-wrapper { margin-bottom: 20px; }
    .swagger-ui .auth-container .auth-btn-wrapper { margin-bottom: 10px; }
    .swagger-ui .scheme-container {
      background: #f7f7f7;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
      border: 1px solid #ddd;
    }
    .swagger-ui .auth-container h4 { color: #3b4151; }
    .swagger-ui .auth-container .wrapper { padding: 20px; }
  `,
  customSiteTitle: "TaskFlow API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: true,
    docExpansion: "list",
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    requestInterceptor: (req: any) => {
      // Ensure proper headers are set
      if (!req.headers["Content-Type"] && req.method !== "GET") {
        req.headers["Content-Type"] = "application/json";
      }
      return req;
    },
    responseInterceptor: (res: any) => {
      // Log responses for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("Swagger Response:", res.status, res.url);
      }
      return res;
    },
  },
};

app.use("/api-docs", swaggerUi.serve as any);
app.get("/api-docs", swaggerUi.setup(swaggerSpec, swaggerOptions) as any);

// Serve OpenAPI spec as JSON
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "TaskFlow API is running",
    timestamp: new Date().toISOString(),
  });
});

// Test authentication endpoint
app.get("/test-auth", authenticate, (req: AuthRequest, res) => {
  res.json({
    success: true,
    message: "Authentication successful",
    user: req.user,
  });
});

// Quick login endpoint for testing (development only)
if (process.env.NODE_ENV === "development") {
  /**
   * @swagger
   * /quick-login:
   *   post:
   *     tags:
   *       - Development
   *     summary: Connexion rapide pour les tests
   *     description: Endpoint de développement pour obtenir rapidement un token de test
   *     security: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 default: "test@example.com"
   *                 description: Email de test (optionnel)
   *     responses:
   *       200:
   *         description: Token généré avec succès
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 token:
   *                   type: string
   *                   description: Token JWT à copier dans "Authorize"
   *                 instructions:
   *                   type: string
   *                   example: "Copiez ce token et cliquez sur 'Authorize' en haut à droite"
   *                 user:
   *                   $ref: '#/components/schemas/User'
   */
  app.post("/quick-login", async (req, res) => {
    try {
      const email = req.body?.email || "test@example.com";

      // Find or create test user
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        const bcrypt = require("bcryptjs");
        const hashedPassword = await bcrypt.hash("password123", 10);

        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: "Test User",
          },
        });
      }

      // Generate token
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        token,
        instructions:
          "Copiez ce token et cliquez sur 'Authorize' en haut à droite de Swagger UI",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to generate test token",
      });
    }
  });
}

/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Vérification de l'état de l'API
 *     description: Endpoint pour vérifier que l'API fonctionne correctement
 *     security: []
 *     responses:
 *       200:
 *         description: API fonctionnelle
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
 *                   example: "TaskFlow API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00.000Z"
 */

/**
 * @swagger
 * /test-auth:
 *   get:
 *     tags:
 *       - Health
 *     summary: Test d'authentification
 *     description: Endpoint pour tester que l'authentification JWT fonctionne
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authentification réussie
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
 *                   example: "Authentication successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: Non authentifié
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
 *                   example: "No token provided"
 */

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/organizations/:organizationId/projects", projectRoutes);
app.use(
  "/api/organizations/:organizationId/projects/:projectId/tasks",
  taskRoutes
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);

    res.status(err.status || 500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
