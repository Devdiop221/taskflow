import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listOrganizations, createOrganization, getOrganization, inviteMember, removeMember } from '../api/organizations';

export const useOrganizations = () =>
  useQuery({ queryKey: ['organizations'], queryFn: listOrganizations });

export const useOrganization = (organizationId?: string) =>
  useQuery({
    queryKey: ['organizations', organizationId],
    queryFn: () => getOrganization(organizationId!),
    enabled: !!organizationId,
  });

export const useCreateOrganization = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });
};

export const useInviteMember = (organizationId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; role: 'ADMIN' | 'MEMBER' }) => inviteMember(organizationId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations', organizationId] }),
  });
};

export const useRemoveMember = (organizationId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMember(organizationId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations', organizationId] }),
  });
};
