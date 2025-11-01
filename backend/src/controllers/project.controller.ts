import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { TenantRequest } from "../types";
import { ProjectStatus } from "@prisma/client";

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "COMPLETED"]).optional(),
});

/**
 * Create new project
 * POST /api/organizations/:organizationId/projects
 */
export const createProject = async (req: TenantRequest, res: Response) => {
  try {
    if (!req.user || !req.organization) {
      return res
        .status(401)
        .json({ success: false, error: "Not authenticated" });
    }

    const { organizationId } = req.params;
    const validatedData = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        organizationId,
        creatorId: req.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: project,
      message: "Project created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create project",
    });
  }
};

/**
 * Get organization projects
 * GET /api/organizations/:organizationId/projects
 */
export const getProjects = async (req: TenantRequest, res: Response) => {
  try {
    const { organizationId } = req.params;
    const { status } = req.query;

    const where: any = { organizationId };

    if (status && typeof status === "string") {
      where.status = status as ProjectStatus;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch projects",
    });
  }
};

/**
 * Get single project
 * GET /api/organizations/:organizationId/projects/:projectId
 */
export const getProject = async (req: TenantRequest, res: Response) => {
  try {
    const { organizationId, projectId } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch project",
    });
  }
};

/**
 * Update project
 * PATCH /api/organizations/:organizationId/projects/:projectId
 */
export const updateProject = async (req: TenantRequest, res: Response) => {
  try {
    const { organizationId, projectId } = req.params;
    const validatedData = updateProjectSchema.parse(req.body);

    // Verify project belongs to organization
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: validatedData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: project,
      message: "Project updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update project",
    });
  }
};

/**
 * Delete project
 * DELETE /api/organizations/:organizationId/projects/:projectId
 */
export const deleteProject = async (req: TenantRequest, res: Response) => {
  try {
    const { organizationId, projectId } = req.params;

    // Verify project belongs to organization
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete project",
    });
  }
};
