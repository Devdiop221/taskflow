import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OrganizationsList from './pages/organizations/OrganizationsList';
import OrganizationCreate from './pages/organizations/OrganizationCreate';
import OrganizationDetail from './pages/organizations/OrganizationDetail';
import ProjectsList from './pages/projects/ProjectsList';
// The following will be created now
import ProjectCreate from './pages/projects/ProjectCreate';
import ProjectDetail from './pages/projects/ProjectDetail';

// Create a client for React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

/**
 * Protected Route component
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

/**
 * Public Route component (redirects to dashboard if authenticated)
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

/**
 * Main App component
 */
function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        }
                    />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Organizations */}
                    <Route
                        path="/organizations"
                        element={
                            <ProtectedRoute>
                                {/** @ts-ignore */}
                                <OrganizationsList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/organizations/new"
                        element={
                            <ProtectedRoute>
                                {/** @ts-ignore */}
                                <OrganizationCreate />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/organizations/:organizationId"
                        element={
                            <ProtectedRoute>
                                {/** @ts-ignore */}
                                <OrganizationDetail />
                            </ProtectedRoute>
                        }
                    />

                    {/* Projects (scoped to organization) */}
                    <Route
                        path="/organizations/:organizationId/projects"
                        element={
                            <ProtectedRoute>
                                {/** @ts-ignore */}
                                <ProjectsList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/organizations/:organizationId/projects/new"
                        element={
                            <ProtectedRoute>
                                {/** @ts-ignore */}
                                <ProjectCreate />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/organizations/:organizationId/projects/:projectId"
                        element={
                            <ProtectedRoute>
                                {/** @ts-ignore */}
                                <ProjectDetail />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>

            {/* Toast notifications */}
            <Toaster position="top-right" richColors />
        </QueryClientProvider>
    );
}

export default App;