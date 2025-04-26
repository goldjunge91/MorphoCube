import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/client/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Plus,
  Box,
  Share2,
  Clock,
  BoxSelect,
  Users,
  Settings,
} from "lucide-react";
import { MorphBox, UserResponse } from "@shared/schema"; // Import UserResponse
import { useAuth } from "@/hooks/use-auth"; // Import useAuth

export default function HomePage() {
  const [, navigate] = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth(); // Get user from useAuth
  const [isLoading, setIsLoading] = useState(false); // Keep local loading state if needed for box data

  // Mock data for development without authentication (Remove or guard this)
  // const mockUser = { ... };
  // const recentBoxes: MorphBox[] = [ ... ];
  // const sharedBoxes: MorphBox[] = [];

  // TODO: Replace mock data with actual data fetching using react-query
  // Example:
  // const { data: recentBoxes, isLoading: isRecentLoading } = useQuery(...)
  // const { data: sharedBoxes, isLoading: isSharedLoading } = useQuery(...)
  // const isLoading = isAuthLoading || isRecentLoading || isSharedLoading;

  // Use mock data only if user is not available (for development/testing)
  const displayUser = user; // Use real user if available
  const recentBoxes: MorphBox[] = user ? [] : [ /* mock data */]; // Replace with actual fetch
  const sharedBoxes: MorphBox[] = user ? [] : [ /* mock data */]; // Replace with actual fetch


  const handleCreateNewBox = () => {
    navigate("/my-boxes?create=true");
  };

  const handleOpenBox = (boxId: number | string) => { // Allow string ID if needed
    navigate(`/my-boxes?id=${boxId}`);
  };

  // Format the last saved time to a readable format
  const formatLastSaved = (timestamp?: Date | string) => { // Accept Date or string
    if (!timestamp) return "Never";

    const lastSavedDate = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - lastSavedDate.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  };

  // Loading state check
  if (isAuthLoading) {
    return <Layout title="Dashboard"><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  // Handle case where user is null after loading (not logged in)
  if (!displayUser) {
    // Optional: Redirect to login or show a message
    // navigate("/auth"); // Or return a message component
    return <Layout title="Dashboard"><p>Please log in.</p></Layout>;
  }

  // Determine if the user has admin privileges (Tenant or Super)
  const hasAdminPrivileges = displayUser.isTenantAdmin || displayUser.isSuperAdmin;

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <section>
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome, {displayUser.username}!
                </h1>
                <p className="text-white/80 max-w-xl">
                  Create, analyze and manage your morphological boxes with our
                  intuitive drag-and-drop interface. Start by creating a new box
                  or continue working on your existing ones.
                </p>
              </div>
              <Button
                className="mt-4 md:mt-0 bg-white text-primary hover:bg-white/90"
                size="lg"
                onClick={handleCreateNewBox}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Box
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BoxSelect className="mr-2 h-5 w-5 text-primary" />
                My Boxes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  recentBoxes?.length || 0 // Replace with actual data length
                )}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" onClick={() => navigate("/my-boxes")}>
                View All
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Share2 className="mr-2 h-5 w-5 text-accent" />
                Shared With Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{sharedBoxes?.length || 0}</p> {/* Replace with actual data length */}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" onClick={() => navigate("/shared")}>
                View All
              </Button>
            </CardFooter>
          </Card>

          {/* Conditional Admin Card */}
          {hasAdminPrivileges && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5 text-info" />
                  {/* Adjust title based on specific role if needed */}
                  {displayUser.isSuperAdmin ? "Super Admin" : "Tenant Management"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {displayUser.isSuperAdmin
                    ? "Manage tenants and global settings"
                    : "Manage users within your tenant"}
                </p>
              </CardContent>
              <CardFooter>
                {/* Link to appropriate admin page */}
                <Button variant="ghost" size="sm" onClick={() => navigate(displayUser.isSuperAdmin ? "/admin/tenants" : "/tenant/users")}>
                  {displayUser.isSuperAdmin ? "Manage Tenants" : "Manage Users"}
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Standard User Quick Settings Card */}
          {!hasAdminPrivileges && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-warning" />
                  Quick Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Update your profile and preferences
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile/settings")}> {/* Adjust link */}
                  Open Settings
                </Button>
              </CardFooter>
            </Card>
          )}
        </section>

        {/* Recent Boxes */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Boxes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentBoxes && recentBoxes.length > 0 ? (
              recentBoxes.slice(0, 6).map((box) => (
                <Card key={box.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{box.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span className="text-xs">
                          Last edited: {formatLastSaved(box.updatedAt)}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {box.description || "No description"}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenBox(box.id)}
                    >
                      <Box className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled // TODO: Implement sharing functionality
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <Box className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Boxes</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  You haven't created any morphological boxes yet. Create your first box to get started.
                </p>
                <Button onClick={handleCreateNewBox}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Box
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}