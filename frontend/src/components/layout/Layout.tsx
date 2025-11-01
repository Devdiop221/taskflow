import {type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useOrganizationStore } from '../../store/organizationStore';
import { Button } from '../../components/ui/Button';
import {
    LogOut,
    Menu,
    X,
    Building2,
    LayoutDashboard,
    FolderKanban,
    ChevronDown,
    Plus,
} from 'lucide-react';
import { cn, getInitials, getAvatarColor } from '../../lib/utils';

interface LayoutProps {
    children: ReactNode;
}

/**
 * Main application layout with sidebar and header
 */
export default function Layout({ children }: LayoutProps) {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { currentOrganization, organizations, setCurrentOrganization } = useOrganizationStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleOrgSwitch = (orgId: string) => {
        const org = organizations.find((o) => o.id === orgId);
        if (org) {
            setCurrentOrganization(org);
            setIsOrgDropdownOpen(false);
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and Mobile Menu */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="lg:hidden mr-2 p-2 rounded-md hover:bg-gray-100"
                            >
                                {isSidebarOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                            <Link to="/dashboard" className="flex items-center">
                                <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">TF</span>
                                </div>
                                <span className="ml-2 text-xl font-bold text-gray-900">
                  TaskFlow
                </span>
                            </Link>
                        </div>

                        {/* Organization Selector */}
                        {currentOrganization && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                                >
                                    <Building2 className="h-5 w-5 text-gray-600" />
                                    <span className="font-medium text-gray-900 hidden sm:inline">
                    {currentOrganization.name}
                  </span>
                                    <ChevronDown className="h-4 w-4 text-gray-600" />
                                </button>

                                {isOrgDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                        <div className="px-4 py-2 border-b border-gray-200">
                                            <p className="text-xs text-gray-500">Switch Organization</p>
                                        </div>
                                        {organizations.map((org) => (
                                            <button
                                                key={org.id}
                                                onClick={() => handleOrgSwitch(org.id)}
                                                className={cn(
                                                    'w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between',
                                                    currentOrganization.id === org.id && 'bg-indigo-50'
                                                )}
                                            >
                                                <span className="text-sm font-medium">{org.name}</span>
                                                {currentOrganization.id === org.id && (
                                                    <div className="h-2 w-2 rounded-full bg-indigo-600" />
                                                )}
                                            </button>
                                        ))}
                                        <div className="border-t border-gray-200 mt-1">
                                            <Link
                                                to="/organizations/new"
                                                className="flex items-center px-4 py-2 text-sm text-indigo-600 hover:bg-gray-50"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Organization
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User Menu */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:flex items-center space-x-3">
                                <div
                                    className={cn(
                                        'h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
                                        getAvatarColor(user?.name || '')
                                    )}
                                >
                                    {getInitials(user?.name || '')}
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20 transition-transform duration-300',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                <nav className="p-4 space-y-1">
                    <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                        to="/projects"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                    >
                        <FolderKanban className="h-5 w-5" />
                        <span className="font-medium">Projects</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="lg:pl-64 pt-16">
                <div className="p-4 sm:p-6 lg:p-8">{children}</div>
            </main>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}