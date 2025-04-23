import { useLocation, Link } from "wouter";
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
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface SimpleSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function SimpleSidebar({ mobileOpen, setMobileOpen }: SimpleSidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "U";

  const navigationItems = [
    { 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      label: "Dashboard", 
      href: "/" 
    },
    { 
      icon: <Table className="h-5 w-5" />, 
      label: "My Morph Boxes", 
      href: "/my-boxes" 
    },
    { 
      icon: <FolderTree className="h-5 w-5" />, 
      label: "Templates", 
      href: "/templates" 
    },
    { 
      icon: <Share2 className="h-5 w-5" />, 
      label: "Shared with me", 
      href: "/shared" 
    }
  ];

  const sidebarClass = mobileOpen
    ? "fixed inset-0 z-50 flex flex-col w-64 lg:w-64 bg-white border-r border-gray-200 h-full shadow-lg lg:static lg:shadow-none lg:flex transition-transform duration-200 ease-in-out transform-gpu translate-x-0"
    : "fixed inset-0 z-50 flex flex-col w-64 lg:w-64 bg-white border-r border-gray-200 h-full lg:static lg:flex transition-transform duration-200 ease-in-out transform-gpu -translate-x-full lg:translate-x-0";

  return (
    <>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={sidebarClass}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary">Morphological Box</h1>
        </div>
        
        <div className="flex flex-col overflow-y-auto flex-1">
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <div
                    className={`flex items-center px-4 py-2 rounded-md transition-colors
                      ${
                        location === item.href
                          ? "text-primary bg-primary bg-opacity-10 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </div>
                </Link>
              </div>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            
            <div>
              <p className="text-sm font-medium text-gray-700">{user?.username || "Guest"}</p>
              <p className="text-xs text-gray-500">{user?.email || ""}</p>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto text-gray-500 hover:text-gray-700"
              title="Logout"
              onClick={() => {
                logoutMutation.mutate(undefined, {
                  onSuccess: () => {
                    toast({
                      title: "Logged out",
                      description: "You have been logged out successfully.",
                    });
                  },
                  onError: (error) => {
                    toast({
                      title: "Logout failed",
                      description: error.message,
                      variant: "destructive",
                    });
                  }
                });
              }}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}