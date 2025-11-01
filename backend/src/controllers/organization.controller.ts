import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest, TenantRequest } from "../types";
import { Role } from "@prisma/client";

// Validation schemas
const createOrgSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
});

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER"]),
});

/**
 * Create new organization
 * POST /api/organizations
 */
export const createOrganization = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: "Not authenticated" });
    }

    const validatedData = createOrgSchema.parse(req.body);

    // Check if slug is already taken
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingOrg) {
      return res.status(409).json({
        success: false,
        error: "Organization slug already taken",
      });
    }

    // Create organization with owner membership
    const organization = await prisma.organization.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: Role.OWNER,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: organization,
      message: "Organization created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Create organization error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create organization",
    });
  }
};

/**
 * Get user's organizations
 * GET /api/organizations
 */
export const getUserOrganizations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, error: "Not authenticated" });
    }

    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        members: {
          where: {
            userId: req.user.id,
          },
          select: {
            role: true,
          },
        },
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format response with user's role
    const formattedOrgs = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      role: org.members[0]?.role,
      memberCount: org._count.members,
      projectCount: org._count.projects,
      createdAt: org.createdAt,
    }));

    res.json({
      success: true,
      data: formattedOrgs,
    });
  } catch (error) {
    console.error("Get organizations error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch organizations",
    });
  }
};

/**
 * Get organization details
 * GET /api/organizations/:organizationId
 */
export const getOrganization = async (req: TenantRequest, res: Response) => {
  try {
    const { organizationId } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: "Organization not found",
      });
    }

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error("Get organization error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch organization",
    });
  }
};

/**
 * Invite member to organization
 * POST /api/organizations/:organizationId/members
 */
export const inviteMember = async (req: TenantRequest, res: Response) => {
  try {
    const { organizationId } = req.params;
    const validatedData = inviteMemberSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found. They need to register first.",
      });
    }

    // Check if already a member
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        error: "User is already a member of this organization",
      });
    }

    // Add member
    const member = await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId,
        role: validatedData.role,
      },
      include: {
        user: {
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
      data: member,
      message: "Member added successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Invite member error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to invite member",
    });
  }
};

/**
 * Remove member from organization
 * DELETE /api/organizations/:organizationId/members/:userId
 */
export const removeMember = async (req: TenantRequest, res: Response) => {
  try {
    const { organizationId, userId } = req.params;

    // Cannot remove the owner
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { ownerId: true },
    });

    if (organization?.ownerId === userId) {
      return res.status(400).json({
        success: false,
        error: "Cannot remove the organization owner",
      });
    }

    await prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    res.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove member",
    });
  }
};
