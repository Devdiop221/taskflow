import { Link, useNavigate } from 'react-router-dom';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useOrganizationStore } from '../../store/organizationStore';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function OrganizationsList() {
  const navigate = useNavigate();
  const { data: orgs, isLoading } = useOrganizations();
  const { currentOrganization, setCurrentOrganization } = useOrganizationStore();

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-500 mt-1">Select or manage your organizations</p>
        </div>
        <Button onClick={() => navigate('/organizations/new')}>New Organization</Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : !orgs || orgs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No organizations yet.</p>
            <Button className="mt-4" onClick={() => navigate('/organizations/new')}>Create one</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map((org) => (
            <Card key={org.id} className={org.id === currentOrganization?.id ? 'border-indigo-300' : ''}>
              <CardHeader>
                <CardTitle>{org.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setCurrentOrganization(org)}>Set current</Button>
                  <Link to={`/organizations/${org.id}`} className="text-indigo-600 hover:text-indigo-500 text-sm">Open</Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
