import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useProjects } from '../../hooks/useProjects';

export default function ProjectsList() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects(organizationId);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Organization: {organizationId}</p>
        </div>
        <Button onClick={() => navigate(`/organizations/${organizationId}/projects/new`)}>New Project</Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : !projects || projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No projects yet.</p>
            <Button className="mt-4" onClick={() => navigate(`/organizations/${organizationId}/projects/new`)}>Create one</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link key={project.id} to={`/organizations/${organizationId}/projects/${project.id}`} className="block">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>{project.name}</CardTitle>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">{project.status}</span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{project.description || 'No description'}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
