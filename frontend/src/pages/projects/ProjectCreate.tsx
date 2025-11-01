import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCreateProject } from '../../hooks/useProjects';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProjectCreate() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateProject(organizationId!);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const project = await mutateAsync(data);
      toast.success('Project created');
      navigate(`/organizations/${organizationId}/projects/${project.id}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to create project');
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create Project</CardTitle>
            <CardDescription>Provide a name and description for your project</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Name" placeholder="Website Redesign" error={errors.name?.message} {...register('name')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Optional description"
                  {...register('description')}
                />
              </div>
              <Button type="submit" isLoading={isPending} className="w-full">Create</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
