import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useOrganization } from '../../hooks/useOrganizations';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInviteMember, useRemoveMember } from '../../hooks/useOrganizations';
import { toast } from 'sonner';

const inviteSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['ADMIN', 'MEMBER']),
});

type InviteForm = z.infer<typeof inviteSchema>;

export default function OrganizationDetail() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const { data: org, isLoading } = useOrganization(organizationId);
  const inviteMutation = useInviteMember(organizationId!);
  const removeMutation = useRemoveMember(organizationId!);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'MEMBER' },
  });

  const onInvite = async (data: InviteForm) => {
    try {
      await inviteMutation.mutateAsync({ email: data.email, role: data.role });
      toast.success('Member invited');
      reset();
    } catch (e: any) {
      toast.error(e.message || 'Failed to invite member');
    }
  };

  const onRemove = async (userId: string) => {
    try {
      await removeMutation.mutateAsync(userId);
      toast.success('Member removed');
    } catch (e: any) {
      toast.error(e.message || 'Failed to remove member');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </Layout>
    );
  }

  if (!org) {
    return (
      <Layout>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">Organization not found</p>
            <Button className="mt-4" onClick={() => navigate('/organizations')}>Back to list</Button>
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
            <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
            <p className="text-gray-500">Slug: {org.slug}</p>
          </div>
          <Link to={`/organizations/${org.id}/projects`} className="text-indigo-600 hover:text-indigo-500">View Projects</Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invite Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onInvite)} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Email" placeholder="user@example.com" error={errors.email?.message} {...register('email')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register('role')}>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button type="submit" isLoading={inviteMutation.isPending} className="w-full">Invite</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            {!org.memberCount || org.memberCount === 0 ? (
              <p className="text-gray-600">No members listed.</p>
            ) : (
              <div className="space-y-2">
                {/* Backend organization detail may include members via controller; if not, this section will be updated later */}
                <p className="text-sm text-muted-foreground">Members info will appear here when provided by the API response.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
