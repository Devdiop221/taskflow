import { Response, NextFunction } from "express";
import { TenantRequest } from "@/types";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

/**
 * Middleware to verify user belongs to the organization
 * Extracts organizationId from params or body and validates membership
 */
export const verifyTenant = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Get organizationId from params or body
    const organizationId = req.params.organizationId || req.body.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: "Organization ID is required",
      });
    }

    // Check if user is a member of the organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: req.user.id,
          organizationId: organizationId,
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You are not a member of this organization.",
      });
    }

    // Attach organization context to request
    req.organization = {
      id: membership.organization.id,
      slug: membership.organization.slug,
      role: membership.role,
    };

    next();
  } catch (error) {
    console.error("Tenancy verification error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to verify organization access",
    });
  }
};

/**
 * Middleware to verify user has required role in organization
 * Must be used after verifyTenant middleware
 */
export const requireRole = (allowedRoles: Role[]) => {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    if (!req.organization) {
      return res.status(403).json({
        success: false,
        error: "Organization context required",
      });
    }

    if (!allowedRoles.includes(req.organization.role)) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required role: ${allowedRoles.join(
          " or "
        )}`,
      });
    }

    next();
  };
};
