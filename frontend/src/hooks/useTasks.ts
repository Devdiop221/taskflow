import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listTasks, createTask, getTask, updateTask, deleteTask } from '../api/tasks';
import type { TaskPriority, TaskStatus } from '../types';

export const useTasks = (
  organizationId?: string,
  projectId?: string,
  filters?: { status?: TaskStatus; priority?: TaskPriority }
) =>
  useQuery({
    queryKey: ['tasks', organizationId, projectId, filters],
    queryFn: () => listTasks(organizationId!, projectId!, filters),
    enabled: !!organizationId && !!projectId,
  });

export const useTask = (organizationId?: string, projectId?: string, taskId?: string) =>
  useQuery({
    queryKey: ['tasks', organizationId, projectId, taskId],
    queryFn: () => getTask(organizationId!, projectId!, taskId!),
    enabled: !!organizationId && !!projectId && !!taskId,
  });

export const useCreateTask = (organizationId: string, projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; description?: string; priority?: TaskPriority; assigneeId?: string; dueDate?: string }) =>
      createTask(organizationId, projectId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', organizationId, projectId] }),
  });
};

export const useUpdateTask = (organizationId: string, projectId: string, taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<{ title: string; description: string; status: TaskStatus; priority: TaskPriority; assigneeId: string; dueDate: string }>) =>
      updateTask(organizationId, projectId, taskId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', organizationId, projectId] });
      qc.invalidateQueries({ queryKey: ['tasks', organizationId, projectId, taskId] });
    },
  });
};

export const useDeleteTask = (organizationId: string, projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(organizationId, projectId, taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', organizationId, projectId] }),
  });
};
