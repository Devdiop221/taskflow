import {type ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
    Search,
    ArrowRight,
} from 'lucide-react';
import { cn, getInitials } from '../../lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../../components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import api from '../../lib/api';
import type { ApiResponse, Project } from '../../types';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Project[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();

    // Search projects and tasks
    useEffect(() => {
        if (!searchQuery.trim() || !currentOrganization) {
            setSearchResults([]);
            return;
        }

        const performSearch = async () => {
            try {
                const response = await api.get<ApiResponse<Project[]>>(
                    `/organizations/${currentOrganization.id}/projects`
                );
                if (response.data.success) {
                    const projects = response.data.data || [];
                    const filtered = projects.filter(p =>
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
                    );
                    setSearchResults(filtered.slice(0, 5)); // Limit to 5 results
                }
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            }
        };

        performSearch();
    }, [searchQuery, currentOrganization]);

    const handleSelectResult = (project: Project) => {
        navigate(`/organizations/${currentOrganization!.id}/projects/${project.id}`);
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleOrgSwitch = (orgId: string) => {
        const org = organizations.find((o) => o.id === orgId);
        if (org) {
            setCurrentOrganization(org);
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur border-b border-gray-200 fixed top-0 left-0 right-0 z-30 shadow-sm">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 gap-4">
                        {/* Logo and Mobile Menu */}
                        <div className="flex items-center min-w-[140px]">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="lg:hidden mr-2 p-2 rounded-lg hover:bg-gray-100"
                            >
                                {isSidebarOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                            <Link to="/dashboard" className="flex items-center">
                                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
                                    <span className="text-white font-bold text-sm">TF</span>
                                </div>
                                <span className="ml-2 text-xl font-bold text-gray-900">TaskFlow</span>
                            </Link>
                        </div>

                        {/* Centered Search */}
                        <div className="hidden md:flex flex-1 max-w-xl mx-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setIsSearchOpen(true);
                                    }}
                                    onFocus={() => setIsSearchOpen(true)}
                                    className="w-full h-10 pl-10 pr-3 rounded-full border border-border/70 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/60 placeholder:text-gray-400"
                                />
                                {/* Search Results Dropdown */}
                                {isSearchOpen && (searchQuery.trim() || searchResults.length > 0) && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsSearchOpen(false)}
                                        />
                                        <div className="absolute top-full mt-2 w-full bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
                                            {searchResults.length > 0 ? (
                                                <div className="space-y-1 p-2">
                                                    {searchResults.map((project) => (
                                                        <button
                                                            key={project.id}
                                                            onClick={() => handleSelectResult(project)}
                                                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between group"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                                                                {project.description && (
                                                                    <p className="text-xs text-gray-500 truncate">{project.description}</p>
                                                                )}
                                                            </div>
                                                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 shrink-0 ml-2" />
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : searchQuery.trim() ? (
                                                <div className="p-4 text-center">
                                                    <p className="text-sm text-gray-500">No projects found</p>
                                                </div>
                                            ) : null}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right actions: Org selector + user */}
                        <div className="flex items-center gap-2">
                            {currentOrganization && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                                            <Building2 className="h-5 w-5 text-gray-600" />
                                            <span className="font-medium text-gray-900 hidden sm:inline">{currentOrganization.name}</span>
                                            <ChevronDown className="h-4 w-4 text-gray-600" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64">
                                        <div className="px-4 py-2 border-b border-border/80">
                                            <p className="text-xs text-muted-foreground">Switch Organization</p>
                                        </div>
                                        {organizations.map((org) => (
                                            <DropdownMenuItem
                                                key={org.id}
                                                onClick={() => handleOrgSwitch(org.id)}
                                                className={cn('flex items-center justify-between', currentOrganization.id === org.id && 'bg-indigo-50')}
                                            >
                                                <span className="text-sm font-medium">{org.name}</span>
                                                {currentOrganization.id === org.id && (
                                                    <div className="h-2 w-2 rounded-full bg-indigo-600" />
                                                )}
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <Link
                                            to="/organizations/new"
                                            className="flex items-center px-3 py-2 text-sm text-indigo-600 hover:bg-gray-50 rounded-md"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Organization
                                        </Link>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            {/* User */}
                            <div className="hidden sm:flex items-center gap-3">
                                <Avatar>
                                    {/* If you later add user images, use <AvatarImage src={user?.imageUrl} /> */}
                                    <AvatarFallback>
                                        {getInitials(user?.name || '')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-16 left-0 bottom-0 w-64 bg-white/90 backdrop-blur border-r border-gray-200 z-20 transition-transform duration-300',
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                <nav className="p-4 space-y-1">
                    {(() => {
                        const orgId = currentOrganization?.id;
                        const items = [
                            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                            { to: orgId ? `/organizations/${orgId}/projects` : '/dashboard', label: 'Projects', icon: FolderKanban },
                        ];
                        return items.map(({ to, label, icon: Icon }) => {
                            const active = location.pathname === to || location.pathname.startsWith(to + '/');
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={cn(
                                        'flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 transition-colors',
                                        active ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{label}</span>
                                </Link>
                            );
                        });
                    })()}
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