import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCreateOrganization } from '../../hooks/useOrganizations';
import { useOrganizationStore } from '../../store/organizationStore';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes only').min(3, 'Slug must be at least 3 characters'),
});

type FormData = z.infer<typeof schema>;

export default function OrganizationCreate() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateOrganization();
  const { setCurrentOrganization, addOrganization } = useOrganizationStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const org = await mutateAsync(data);
      addOrganization(org);
      setCurrentOrganization(org);
      toast.success('Organization created');
      navigate(`/organizations/${org.id}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to create organization');
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create Organization</CardTitle>
            <CardDescription>Set a name and a unique slug for your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Name" placeholder="Acme Inc." error={errors.name?.message} {...register('name')} />
              <Input label="Slug" placeholder="acme-inc" error={errors.slug?.message} {...register('slug')} />
              <Button type="submit" isLoading={isPending} className="w-full">Create</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
