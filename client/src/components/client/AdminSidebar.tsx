import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    LayoutDashboard,
    Table,
    FolderTree,
    Share2,
    Users,
    Settings,
    LogOut,
    Building2,
    UserCog,
    ServerCog,
    Layers,
    Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

export default function AdminSidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
    const [location] = useLocation();
    const { user, tenant, logoutMutation } = useAuth();
    const { toast } = useToast();

    const HandleLogout = () => {
        logoutMutation.mutate(undefined, {
            onSuccess: () => {
                toast({
                    title: "Erfolgreicher Logout",
                    description: "Sie wurden erfolgreich abgemeldet."
                });
            },
            onError: (error: any) => {
                toast({
                    title: "Logout fehlgeschlagen",
                    description: error.message || "Ein Fehler ist aufgetreten.",
                    variant: "destructive"
                });
            }
        });
    };

    const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "U";

    // Basis-Navigation für alle Benutzer
    const regular_navigation_items = [
        {
            icon: <LayoutDashboard className="h-5 w-5" />,
            label: "Dashboard",
            href: "/"
        },
        {
            icon: <Table className="h-5 w-5" />,
            label: "Meine Morph Boxen",
            href: "/my-boxes"
        },
        {
            icon: <FolderTree className="h-5 w-5" />,
            label: "Vorlagen",
            href: "/templates"
        },
        {
            icon: <Share2 className="h-5 w-5" />,
            label: "Mit mir geteilt",
            href: "/shared"
        }
    ];

    // Tenant-Admin-Navigation
    const tenant_admin_items = user?.isTenantAdmin ? [
        {
            icon: <UserCog className="h-5 w-5" />,
            label: "Benutzerverwaltung",
            href: "/tenant/users"
        },
        {
            icon: <Settings className="h-5 w-5" />,
            label: "Tenant-Einstellungen",
            href: "/tenant/settings"
        }
    ] : [];

    // Super-Admin-Navigation
    const super_admin_items = user?.isSuperAdmin ? [
        {
            icon: <Building2 className="h-5 w-5" />,
            label: "Tenants",
            href: "/admin/tenants"
        },
        {
            icon: <Users className="h-5 w-5" />,
            label: "Globale Benutzer",
            href: "/admin/users"
        },
        {
            icon: <ServerCog className="h-5 w-5" />,
            label: "System-Einstellungen",
            href: "/admin/settings"
        }
    ] : [];

    const sidebarClass = mobileOpen
        ? "fixed inset-0 z-50 flex flex-col w-64 lg:w-64 bg-white border-r border-gray-200 h-full shadow-lg lg:static lg:shadow-none lg:flex transition-transform duration-200 ease-in-out transform-gpu translate-x-0"
        : "fixed inset-0 z-50 flex flex-col w-64 lg:w-64 bg-white border-r border-gray-200 h-full lg:static lg:flex transition-transform duration-200 ease-in-out transform-gpu -translate-x-full lg:translate-x-0";

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={sidebarClass}>
                <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-primary">Morphological Box</h1>
                    {tenant && (
                        <Badge variant="outline" className="ml-2">
                            {tenant.name}
                        </Badge>
                    )}
                </div>

                <div className="flex flex-col overflow-y-auto flex-1">
                    <nav className="p-4 space-y-1">
                        {/* Reguläre Navigation */}
                        {regular_navigation_items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                            >
                                <div
                                    className={`flex items-center px-4 py-2 rounded-md transition-colors
                    ${location === item.href
                                            ? "text-primary bg-primary bg-opacity-10 font-medium"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }
                  `}
                                >
                                    {item.icon}
                                    <span className="ml-3">{item.label}</span>
                                </div>
                            </Link>
                        ))}

                        {/* Tenant Admin Navigation */}
                        {tenant_admin_items.length > 0 && (
                            <div className="pt-4 mt-4 border-t border-gray-200">
                                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Tenant Administration
                                </h3>
                                {tenant_admin_items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <div
                                            className={`flex items-center px-4 py-2 mt-1 rounded-md transition-colors
                        ${location === item.href
                                                    ? "text-primary bg-primary bg-opacity-10 font-medium"
                                                    : "text-gray-700 hover:bg-gray-100"
                                                }
                      `}
                                        >
                                            {item.icon}
                                            <span className="ml-3">{item.label}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Super Admin Navigation */}
                        {super_admin_items.length > 0 && (
                            <div className={`pt-4 mt-4 ${tenant_admin_items.length > 0 ? "" : "border-t border-gray-200"}`}>
                                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Super Administration
                                </h3>
                                {super_admin_items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <div
                                            className={`flex items-center px-4 py-2 mt-1 rounded-md transition-colors
                        ${location === item.href || location.startsWith(item.href + '/')
                                                    ? "text-primary bg-primary bg-opacity-10 font-medium"
                                                    : "text-gray-700 hover:bg-gray-100"
                                                }
                      `}
                                        >
                                            {item.icon}
                                            <span className="ml-3">{item.label}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </nav>
                </div>

                {/* User Profile und Logout */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{user?.username}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto text-gray-500 hover:text-gray-700"
                            onClick={HandleLogout}
                            title="Abmelden"
                            disabled={logoutMutation.isPending}
                        >
                            {logoutMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <LogOut className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Rollen-Indikatoren */}
                    {(user?.isSuperAdmin || user?.isTenantAdmin) && (
                        <div className="flex gap-2 mt-2">
                            {user?.isSuperAdmin && (
                                <Badge variant="secondary" className="text-xs">Super Admin</Badge>
                            )}
                            {user?.isTenantAdmin && (
                                <Badge variant="outline" className="text-xs">Tenant Admin</Badge>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}