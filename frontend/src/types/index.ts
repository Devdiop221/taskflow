/**
 * User type
 */
export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
}

/**
 * Organization role enum
 */
export const Role = {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER'
} as const;
export type Role = typeof Role[keyof typeof Role];

/**
 * Organization type
 */
export interface Organization {
    id: string;
    name: string;
    slug: string;
    role?: Role;
    memberCount?: number;
    projectCount?: number;
    createdAt: string;
}

/**
 * Organization member type
 */
export interface OrganizationMember {
    id: string;
    role: Role;
    joinedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

/**
 * Project status enum
 */
export const ProjectStatus = {
    ACTIVE: 'ACTIVE',
    ARCHIVED: 'ARCHIVED',
    COMPLETED: 'COMPLETED'
} as const;
export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

/**
 * Project type
 */
export interface Project {
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    organizationId: string;
    creatorId: string;
    creator?: {
        id: string;
        name: string;
        email: string;
    };
    tasks?: Task[];
    _count?: {
        tasks: number;
    };
    createdAt: string;
    updatedAt: string;
}

/**
 * Task status enum
 */
export const TaskStatus = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE'
} as const;
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

/**
 * Task priority enum
 */
export const TaskPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
} as const;
export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

/**
 * Task type
 */
export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    projectId: string;
    assigneeId?: string;
    assignee?: {
        id: string;
        name: string;
        email: string;
    };
    creatorId: string;
    creator?: {
        id: string;
        name: string;
    };
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    details?: any;
}

/**
 * Auth context type
 */
export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}