import api from '../lib/api';
import type { ApiResponse, Organization, OrganizationMember, Role } from '../types';

export async function listOrganizations() {
  const { data } = await api.get<ApiResponse<Organization[]>>('/organizations');
  if (!data.success) throw new Error(data.error || 'Unable to fetch organizations');
  return data.data || [];
}

export async function createOrganization(payload: { name: string; slug: string }) {
  const { data } = await api.post<ApiResponse<Organization>>('/organizations', payload);
  if (!data.success || !data.data) throw new Error(data.error || 'Create organization failed');
  return data.data;
}

export async function getOrganization(organizationId: string) {
  const { data } = await api.get<ApiResponse<Organization>>(`/organizations/${organizationId}`);
  if (!data.success || !data.data) throw new Error(data.error || 'Get organization failed');
  return data.data;
}

export async function inviteMember(
  organizationId: string,
  payload: { email: string; role: Exclude<Role, 'OWNER'> }
) {
  const { data } = await api.post<ApiResponse<OrganizationMember>>(
    `/organizations/${organizationId}/members`,
    payload
  );
  if (!data.success || !data.data) throw new Error(data.error || 'Invite member failed');
  return data.data;
}

export async function removeMember(organizationId: string, userId: string) {
  const { data } = await api.delete<ApiResponse>(
    `/organizations/${organizationId}/members/${userId}`
  );
  if (!data.success) throw new Error(data.error || 'Remove member failed');
  return true;
}
