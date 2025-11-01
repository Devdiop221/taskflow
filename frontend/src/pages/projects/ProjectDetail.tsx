import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useProject, useUpdateProject, useDeleteProject } from '../../hooks/useProjects';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../hooks/useTasks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ProjectStatus, TaskPriority, TaskStatus } from '../../types';
import { toast } from 'sonner';

const createTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().optional(),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

type UpdateProjectForm = Partial<{ name: string; description: string; status: ProjectStatus }>;

type UpdateTaskForm = Partial<{ status: TaskStatus; priority: TaskPriority }>;

export default function ProjectDetail() {
  const { organizationId, projectId } = useParams<{ organizationId: string; projectId: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading: isLoadingProject } = useProject(organizationId, projectId);
  const updateProject = useUpdateProject(organizationId!, projectId!);
  const deleteProject = useDeleteProject(organizationId!);

  const { data: tasks, isLoading: isLoadingTasks } = useTasks(organizationId, projectId);
  const createTask = useCreateTask(organizationId!, projectId!);

  const {
    register: registerCreateTask,
    handleSubmit: handleSubmitCreateTask,
    reset: resetCreateTask,
    formState: { errors: createTaskErrors },
  } = useForm<CreateTaskForm>({ resolver: zodResolver(createTaskSchema) });

  const onCreateTask = async (data: CreateTaskForm) => {
    try {
      await createTask.mutateAsync({ ...data });
      toast.success('Task created');
      resetCreateTask();
    } catch (e: any) {
      toast.error(e.message || 'Failed to create task');
    }
  };

  const onUpdateProject = async (data: UpdateProjectForm) => {
    try {
      await updateProject.mutateAsync(data);
      toast.success('Project updated');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update project');
    }
  };

  const onDeleteProject = async () => {
    try {
      await deleteProject.mutateAsync(projectId!);
      toast.success('Project deleted');
      navigate(`/organizations/${organizationId}/projects`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete project');
    }
  };

  const TaskRow = ({ taskId, title, status, priority }: { taskId: string; title: string; status: TaskStatus; priority: TaskPriority }) => {
    const updateTask = useUpdateTask(organizationId!, projectId!, taskId);
    const deleteTask = useDeleteTask(organizationId!, projectId!);

    const onChange = async (changes: UpdateTaskForm) => {
      try {
        await updateTask.mutateAsync(changes);
        toast.success('Task updated');
      } catch (e: any) {
        toast.error(e.message || 'Failed to update task');
      }
    };

    const onDelete = async () => {
      try {
        await deleteTask.mutateAsync(taskId);
        toast.success('Task deleted');
      } catch (e: any) {
        toast.error(e.message || 'Failed to delete task');
      }
    };

    return (
      <div className="flex items-center justify-between p-3 rounded-md border border-gray-200">
        <div>
          <p className="font-medium">{title}</p>
          <div className="text-sm text-gray-600">{status} • {priority}</div>
        </div>
        <div className="flex items-center gap-2">
          <select
            defaultValue={status}
            onChange={(e) => onChange({ status: e.target.value as TaskStatus })}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
          <select
            defaultValue={priority}
            onChange={(e) => onChange({ priority: e.target.value as TaskPriority })}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
          <Button variant="destructive" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    );
  };

  if (isLoadingProject) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">Project not found</p>
            <Button className="mt-4" onClick={() => navigate(`/organizations/${organizationId}/projects`)}>Back to list</Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.description || 'No description'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/organizations/${organizationId}/projects`} className="text-indigo-600 hover:text-indigo-500">Back to projects</Link>
            <Button variant="destructive" onClick={onDeleteProject}>Delete Project</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const payload: UpdateProjectForm = {
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  status: formData.get('status') as ProjectStatus,
                };
                onUpdateProject(payload);
              }}
              className="grid grid-cols-1 md:grid-cols-4 gap-3"
            >
              <Input name="name" label="Name" defaultValue={project.name} />
              <Input name="description" label="Description" defaultValue={project.description} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" defaultValue={project.status as string} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitCreateTask(onCreateTask)} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <Input label="Title" placeholder="Implement auth" error={createTaskErrors.title?.message} {...registerCreateTask('title')} />
              <Input label="Description" placeholder="Optional" {...registerCreateTask('description')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...registerCreateTask('priority')}>
                  <option value="">Select priority</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" isLoading={createTask.isPending} className="w-full">Add Task</Button>
              </div>
            </form>

            {isLoadingTasks ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : !tasks || tasks.length === 0 ? (
              <p className="text-gray-600">No tasks yet.</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((t) => (
                  <TaskRow key={t.id} taskId={t.id} title={t.title} status={t.status} priority={t.priority} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
