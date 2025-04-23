import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export default function AppLayout({ 
  children,
  requireAuth = false,
  requireAdmin = false
}: AppLayoutProps) {
  const { user, isLoading } = useAuth();

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <TooltipProvider>
        <Toaster />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </TooltipProvider>
    );
  }

  // Redirect to auth page if authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return <Redirect to="/auth" />;
  }

  // Redirect to home page if admin rights are required but user is not admin
  if (requireAdmin && (!user || !user.isAdmin)) {
    return <Redirect to="/" />;
  }

  return (
    <TooltipProvider>
      <Toaster />
      <div className="min-h-screen">
        {children}
      </div>
    </TooltipProvider>
  );
}