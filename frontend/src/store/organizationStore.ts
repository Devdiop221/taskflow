import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {Organization} from '../types';

/**
 * Organization store state
 */
interface OrganizationState {
    currentOrganization: Organization | null;
    organizations: Organization[];
    setCurrentOrganization: (org: Organization | null) => void;
    setOrganizations: (orgs: Organization[]) => void;
    addOrganization: (org: Organization) => void;
}

/**
 * Zustand store for organization management
 * Handles organization switching and current context
 */
export const useOrganizationStore = create<OrganizationState>()(
    persist(
        (set) => ({
            currentOrganization: null,
            organizations: [],

            setCurrentOrganization: (org) => set({ currentOrganization: org }),

            setOrganizations: (orgs) => set({ organizations: orgs }),

            addOrganization: (org) =>
                set((state) => ({
                    organizations: [...state.organizations, org],
                    currentOrganization: org, // Auto-switch to new organization
                })),
        }),
        {
            name: 'organization-storage',
        }
    )
);