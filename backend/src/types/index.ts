import { Request } from "express";
import { Role } from "@prisma/client";

/**
 * Extended Express Request with authenticated user
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Extended Express Request with organization context
 */
export interface TenantRequest extends AuthRequest {
  organization?: {
    id: string;
    slug: string;
    role: Role;
  };
}

/**
 * JWT Payload structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
