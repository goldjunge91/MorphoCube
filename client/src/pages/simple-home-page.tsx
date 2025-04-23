import { useState } from "react";
import { useLocation } from "wouter";
import SimpleLayout from "@/components/simple-layout";
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
  Settings,
} from "lucide-react";
import { MorphBox } from "@shared/schema";

export default function SimpleHomePage() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data for development without authentication
  const user = {
    id: 1,
    username: "User",
    email: "user@example.com",
    isAdmin: false
  };
  
  const recentBoxes: MorphBox[] = [
    {
      id: 1,
      title: "Product Development Strategy",
      description: "Analyzing various product development approaches and methodologies",
      userId: 1,
      content: "{}",
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      title: "Market Entry Analysis",
      description: "Evaluating different market entry strategies for our new product line",
      userId: 1,
      content: "{}",
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(Date.now() - 86400000) // 1 day ago
    }
  ];
  
  const sharedBoxes: MorphBox[] = [];

  const handleCreateNewBox = () => {
    navigate("/my-boxes?create=true");
  };

  const handleOpenBox = (boxId: number) => {
    navigate(`/my-boxes?id=${boxId}`);
  };

  // Format the last saved time to a readable format
  const formatLastSaved = (timestamp?: string) => {
    if (!timestamp) return "Never";
    
    const lastSavedDate = new Date(timestamp);
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

  return (
    <SimpleLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <section>
          <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome, {user.username}!
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
                  recentBoxes?.length || 0
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
              <p className="text-3xl font-bold">{sharedBoxes?.length || 0}</p>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" onClick={() => navigate("/shared")}>
                View All
              </Button>
            </CardFooter>
          </Card>

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
              <Button variant="ghost" size="sm">
                Open Settings
              </Button>
            </CardFooter>
          </Card>
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
                          Last edited: {formatLastSaved(box.updatedAt.toString())}
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
                      disabled
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
    </SimpleLayout>
  );
}