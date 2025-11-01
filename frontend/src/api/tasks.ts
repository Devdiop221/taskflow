import api from '../lib/api';
import type { ApiResponse, Task, TaskPriority, TaskStatus } from '../types';

export async function listTasks(
  organizationId: string,
  projectId: string,
  params?: { status?: TaskStatus; priority?: TaskPriority }
) {
  const { data } = await api.get<ApiResponse<Task[]>>(
    `/organizations/${organizationId}/projects/${projectId}/tasks`,
    { params }
  );
  if (!data.success) throw new Error(data.error || 'Unable to fetch tasks');
  return data.data || [];
}

export async function createTask(
  organizationId: string,
  projectId: string,
  payload: { title: string; description?: string; priority?: TaskPriority; assigneeId?: string; dueDate?: string }
) {
  const { data } = await api.post<ApiResponse<Task>>(
    `/organizations/${organizationId}/projects/${projectId}/tasks`,
    payload
  );
  if (!data.success || !data.data) throw new Error(data.error || 'Create task failed');
  return data.data;
}

export async function getTask(
  organizationId: string,
  projectId: string,
  taskId: string
) {
  const { data } = await api.get<ApiResponse<Task>>(
    `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}`
  );
  if (!data.success || !data.data) throw new Error(data.error || 'Get task failed');
  return data.data;
}

export async function updateTask(
  organizationId: string,
  projectId: string,
  taskId: string,
  payload: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'assigneeId' | 'dueDate'>>
) {
  const { data } = await api.patch<ApiResponse<Task>>(
    `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}`,
    payload
  );
  if (!data.success || !data.data) throw new Error(data.error || 'Update task failed');
  return data.data;
}

export async function deleteTask(
  organizationId: string,
  projectId: string,
  taskId: string
) {
  const { data } = await api.delete<ApiResponse>(
    `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}`
  );
  if (!data.success) throw new Error(data.error || 'Delete task failed');
  return true;
}
