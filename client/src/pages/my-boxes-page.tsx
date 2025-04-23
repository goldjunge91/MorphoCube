import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout";
import MorphBoxCreator from "@/components/morph-box-creator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Plus,
  Box,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Share2,
  Copy,
  Clock,
  Download,
  XCircle,
} from "lucide-react";
import { MorphBox } from "@shared/schema";

export default function MyBoxesPage() {
  const [searchLocation, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBox, setEditingBox] = useState<MorphBox | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [boxToDelete, setBoxToDelete] = useState<MorphBox | null>(null);

  // Parse URL parameters for editing or creating a box
  useEffect(() => {
    const params = new URLSearchParams(searchLocation.split('?')[1]);
    const boxId = params.get('id');
    const createParam = params.get('create');
    
    if (boxId) {
      // Fetch the specific box and set it for editing
      fetchBoxById(parseInt(boxId));
    } else if (createParam === 'true') {
      setIsCreating(true);
    }
  }, [searchLocation]);

  // Fetch all boxes
  const { data: morphBoxes, isLoading } = useQuery<MorphBox[]>({
    queryKey: ["/api/morphboxes"],
  });

  // Fetch specific box by ID
  const fetchBoxById = async (id: number) => {
    try {
      const response = await fetch(`/api/morphboxes/${id}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch box");
      }
      
      const data = await response.json();
      setEditingBox(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load the morphological box",
        variant: "destructive",
      });
    }
  };

  // Delete box mutation
  const deleteBoxMutation = useMutation({
    mutationFn: async (boxId: number) => {
      await apiRequest("DELETE", `/api/morphboxes/${boxId}`);
      return boxId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/morphboxes"] });
      setBoxToDelete(null);
      setDeleteDialogOpen(false);
      
      toast({
        title: "Box deleted",
        description: "The morphological box has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateNewBox = () => {
    setEditingBox(null);
    setIsCreating(true);
    navigate("/my-boxes?create=true");
  };

  const handleEditBox = (box: MorphBox) => {
    setEditingBox(box);
    setIsCreating(false);
    navigate(`/my-boxes?id=${box.id}`);
  };

  const handleDeleteBox = (box: MorphBox) => {
    setBoxToDelete(box);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteBox = () => {
    if (boxToDelete) {
      deleteBoxMutation.mutate(boxToDelete.id);
    }
  };

  const handleCloseEditor = () => {
    setEditingBox(null);
    setIsCreating(false);
    navigate("/my-boxes");
  };

  const handleBoxSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/morphboxes"] });
  };

  // Filter boxes based on search term and active tab
  const filteredBoxes = morphBoxes
    ? morphBoxes
        .filter(box => 
          searchTerm 
            ? box.title.toLowerCase().includes(searchTerm.toLowerCase())
            : true
        )
        .filter(box => {
          if (activeTab === "all") return true;
          if (activeTab === "recent") {
            // Consider boxes from the last 7 days as recent
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return new Date(box.updatedAt) >= sevenDaysAgo;
          }
          return false;
        })
    : [];

  // If editing or creating a box, show the morph box creator
  if (editingBox || isCreating) {
    return (
      <Layout title={editingBox ? `Editing: ${editingBox.title}` : "Create New Box"}>
        <div className="mb-4 flex items-center">
          <Button variant="outline" onClick={handleCloseEditor}>
            &larr; Back to My Boxes
          </Button>
        </div>
        
        <MorphBoxCreator
          morphBoxId={editingBox?.id}
          initialTitle={editingBox?.title || "New Morphological Box"}
          initialDescription={editingBox?.description || ""}
          onSaved={handleBoxSaved}
        />
      </Layout>
    );
  }

  // Format the last saved time to a readable format
  const formatLastSaved = (timestamp?: string) => {
    if (!timestamp) return "Never";
    
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout title="My Morphological Boxes">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">My Morphological Boxes</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Input
                placeholder="Search boxes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={handleCreateNewBox}>
              <Plus className="h-4 w-4 mr-2" />
              New Box
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Boxes</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !filteredBoxes.length ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <Box className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "No Results Found" : "No Morphological Boxes"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  {searchTerm
                    ? "No boxes match your search. Try with different keywords."
                    : "You haven't created any morphological boxes yet. Create your first box to get started."}
                </p>
                {searchTerm ? (
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                ) : (
                  <Button onClick={handleCreateNewBox}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Box
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBoxes.map((box) => (
                  <Card key={box.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="truncate">{box.title}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditBox(box)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBox(box)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
                        variant="default" 
                        size="sm"
                        onClick={() => handleEditBox(box)}
                      >
                        Open
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBox(box)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="recent" className="mt-6">
            {/* Content for recent tab - React will automatically show this when the tab is active */}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Morphological Box</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{boxToDelete?.title}"? This action cannot be undone
              and all data associated with this box will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBox}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
