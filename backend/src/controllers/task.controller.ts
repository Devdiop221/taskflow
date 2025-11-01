import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { TenantRequest } from "../types";
import { TaskStatus, TaskPriority } from "@prisma/client";

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

/**
 * Create new task
 * POST /api/organizations/:organizationId/projects/:projectId/tasks
 */
export const createTask = async (req: TenantRequest, res: Response) => {
  try {
    if (!req.user || !req.organization) {
      return res
        .status(401)
        .json({ success: false, error: "Not authenticated" });
    }

    const { organizationId, projectId } = req.params;
    const validatedData = createTaskSchema.parse(req.body);

    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    // If assigneeId is provided, verify the user is a member of the organization
    if (validatedData.assigneeId) {
      const member = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: validatedData.assigneeId,
            organizationId,
          },
        },
      });

      if (!member) {
        return res.status(400).json({
          success: false,
          error: "Assignee must be a member of the organization",
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority as TaskPriority,
        projectId,
        assigneeId: validatedData.assigneeId,
        creatorId: req.user.id,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      },
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
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: task,
      message: "Task created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create task",
    });
  }
};

/**
 * Get project tasks
 * GET /api/organizations/:organizationId/projects/:projectId/tasks
 */
export const getTasks = async (req: TenantRequest, res: Response) => {
  try {
    const { organizationId, projectId } = req.params;
    const { status, priority, assigneeId } = req.query;

    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    const where: any = { projectId };

    if (status && typeof status === "string") {
      where.status = status as TaskStatus;
    }

    if (priority && typeof priority === "string") {
      where.priority = priority as TaskPriority;
    }

    if (assigneeId && typeof assigneeId === "string") {
      where.assigneeId = assigneeId;
    }

    const tasks = await prisma.task.findMany({
      where,
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
            email: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tasks",
    });
  }
};

/**
 * Get single task
 * GET /api/organizations/:organizationId/projects/:projectId/tasks/:taskId
 */
export const getTask = async (req: TenantRequest, res: Response) => {
  try {
    const { organizationId, projectId, taskId } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          id: projectId,
          organizationId,
        },
      },
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
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch task",
    });
  }
};

/**
 * Update task
 * PATCH /api/organizations/:organizationId/projects/:projectId/tasks/:taskId
 */
export const updateTask = async (req: TenantRequest, res: Response) => {
  try {
    const { organizationId, projectId, taskId } = req.params;
    const validatedData = updateTaskSchema.parse(req.body);

    // Verify task belongs to project and organization
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          id: projectId,
          organizationId,
        },
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    // If assigneeId is provided, verify the user is a member of the organization
    if (validatedData.assigneeId) {
      const member = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: validatedData.assigneeId,
            organizationId,
          },
        },
      });

      if (!member) {
        return res.status(400).json({
          success: false,
          error: "Assignee must be a member of the organization",
        });
      }
    }

    const updateData: any = { ...validatedData };
    if (validatedData.dueDate) {
      updateData.dueDate = new Date(validatedData.dueDate);
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
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
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: task,
      message: "Task updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update task",
    });
  }
};

/**
 * Delete task
 * DELETE /api/organizations/:organizationId/projects/:projectId/tasks/:taskId
 */
export const deleteTask = async (req: TenantRequest, res: Response) => {
  try {
    const { organizationId, projectId, taskId } = req.params;

    // Verify task belongs to project and organization
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          id: projectId,
          organizationId,
        },
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete task",
    });
  }
};
