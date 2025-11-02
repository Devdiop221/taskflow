import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useOrganizationStore } from '../store/organizationStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Layout from '../components/layout/Layout';
import api from '../lib/api';
import type {ApiResponse, Organization, Project} from '../types';
import { Building2, FolderKanban, Users, Plus, ArrowRight } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { Link } from 'react-router-dom';

/**
 * Dashboard page - shows organizations or redirects to setup
 */
export default function Dashboard() {
    const navigate = useNavigate();
    const { currentOrganization, setOrganizations, setCurrentOrganization } =
        useOrganizationStore();

    // Fetch user's organizations
    const { data: orgsData, isLoading: isLoadingOrgs } = useQuery({
        queryKey: ['organizations'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<Organization[]>>('/organizations');
            return response.data.data;
        },
    });

    // Fetch current organization's projects
    const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
        queryKey: ['projects', currentOrganization?.id],
        queryFn: async () => {
            if (!currentOrganization) return [];
            const response = await api.get<ApiResponse<Project[]>>(
                `/organizations/${currentOrganization.id}/projects`
            );
            return response.data.data;
        },
        enabled: !!currentOrganization,
    });

    // Set organizations when data is loaded
    useEffect(() => {
        if (orgsData) {
            setOrganizations(orgsData);
            if (!currentOrganization && orgsData.length > 0) {
                setCurrentOrganization(orgsData[0]);
            }
        }
    }, [orgsData, setOrganizations, currentOrganization, setCurrentOrganization]);

    // Redirect to create organization if none exist
    useEffect(() => {
        if (!isLoadingOrgs && orgsData?.length === 0) {
            navigate('/organizations/new');
        }
    }, [isLoadingOrgs, orgsData, navigate]);

    if (isLoadingOrgs) {
        return (
            <Layout>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="mt-2 h-4 w-32" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-28 rounded-xl" />
                        <Skeleton className="h-28 rounded-xl" />
                        <Skeleton className="h-28 rounded-xl" />
                    </div>
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </Layout>
        );
    }

    if (!currentOrganization) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No organization</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by creating a new organization.
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => navigate('/organizations/new')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Organization
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    const projects = projectsData || [];
    const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
    const totalTasks = projects.reduce((acc, p) => acc + (p._count?.tasks || 0), 0);

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500 mt-1">{currentOrganization.name}</p>
                    </div>
                    <Button onClick={() => currentOrganization && navigate(`/organizations/${currentOrganization.id}/projects/new`)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{activeProjects}</p>
                                </div>
                                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <FolderKanban className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalTasks}</p>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="h-6 w-6 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {currentOrganization.memberCount || 0}
                                    </p>
                                </div>
                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Projects */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Recent Projects</CardTitle>
                            <Link to={currentOrganization ? `/organizations/${currentOrganization.id}/projects` : '/dashboard'} className="text-sm text-indigo-600 hover:text-indigo-500">
                                View all
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingProjects ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-12">
                                <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by creating a new project.
                                </p>
                                <div className="mt-6">
                                    <Button onClick={() => currentOrganization && navigate(`/organizations/${currentOrganization.id}/projects/new`)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Project
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {projects.slice(0, 5).map((project) => (
                                    <Link
                                        key={project.id}
                                        to={`/organizations/${currentOrganization.id}/projects/${project.id}`}
                                        className="block p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                                {project.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                                                )}
                                                <div className="flex items-center mt-2 text-sm text-gray-500">
                          <span className="inline-flex items-center">
                            {project._count?.tasks || 0} tasks
                          </span>
                                                    <span className="mx-2">•</span>
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            project.status === 'ACTIVE'
                                                                ? 'bg-green-100 text-green-800'
                                                                : project.status === 'COMPLETED'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                            {project.status}
                          </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}