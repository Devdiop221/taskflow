import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listProjects, createProject, getProject, updateProject, deleteProject } from '../api/projects';
import type { ProjectStatus } from '../types';

export const useProjects = (organizationId?: string, status?: ProjectStatus) =>
  useQuery({
    queryKey: ['projects', organizationId, { status }],
    queryFn: () => listProjects(organizationId!, status ? { status } : undefined),
    enabled: !!organizationId,
  });

export const useProject = (organizationId?: string, projectId?: string) =>
  useQuery({
    queryKey: ['projects', organizationId, projectId],
    queryFn: () => getProject(organizationId!, projectId!),
    enabled: !!organizationId && !!projectId,
  });

export const useCreateProject = (organizationId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) => createProject(organizationId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', organizationId] }),
  });
};

export const useUpdateProject = (organizationId: string, projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<{ name: string; description: string; status: ProjectStatus }>) => updateProject(organizationId, projectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', organizationId] });
      qc.invalidateQueries({ queryKey: ['projects', organizationId, projectId] });
    },
  });
};

export const useDeleteProject = (organizationId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => deleteProject(organizationId, projectId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', organizationId] }),
  });
};
