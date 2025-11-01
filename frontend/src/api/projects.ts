import api from '../lib/api';
import type { ApiResponse, Project, ProjectStatus } from '../types';

export async function listProjects(
  organizationId: string,
  params?: { status?: ProjectStatus }
) {
  const { data } = await api.get<ApiResponse<Project[]>>(
    `/organizations/${organizationId}/projects`,
    { params }
  );
  if (!data.success) throw new Error(data.error || 'Unable to fetch projects');
  return data.data || [];
}

export async function createProject(
  organizationId: string,
  payload: { name: string; description?: string }
) {
  const { data } = await api.post<ApiResponse<Project>>(
    `/organizations/${organizationId}/projects`,
    payload
  );
  if (!data.success || !data.data) throw new Error(data.error || 'Create project failed');
  return data.data;
}

export async function getProject(
  organizationId: string,
  projectId: string
) {
  const { data } = await api.get<ApiResponse<Project>>(
    `/organizations/${organizationId}/projects/${projectId}`
  );
  if (!data.success || !data.data) throw new Error(data.error || 'Get project failed');
  return data.data;
}

export async function updateProject(
  organizationId: string,
  projectId: string,
  payload: Partial<Pick<Project, 'name' | 'description' | 'status'>>
) {
  const { data } = await api.patch<ApiResponse<Project>>(
    `/organizations/${organizationId}/projects/${projectId}`,
    payload
  );
  if (!data.success || !data.data) throw new Error(data.error || 'Update project failed');
  return data.data;
}

export async function deleteProject(
  organizationId: string,
  projectId: string
) {
  const { data } = await api.delete<ApiResponse>(
    `/organizations/${organizationId}/projects/${projectId}`
  );
  if (!data.success) throw new Error(data.error || 'Delete project failed');
  return true;
}
