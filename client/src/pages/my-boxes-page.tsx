import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/client/layout";
import MorphBoxCreator from "@/components/client/morph-box-creator";
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
  const [search_location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  const [active_tab, setActiveTab] = useState("all");
  const [search_term, setSearchTerm] = useState("");
  const [editing_box, setEditingBox] = useState<MorphBox | null>(null);
  const [is_creating, setIsCreating] = useState(false);
  const [delete_dialog_open, setDeleteDialogOpen] = useState(false);
  const [box_to_delete, setBoxToDelete] = useState<MorphBox | null>(null);

  // Parse URL parameters for editing or creating a box
  useEffect(() => {
    const params = new URLSearchParams(search_location.split('?')[1] || "");
    const box_id = params.get('id');
    const create_param = params.get('create');

    if (box_id && !isNaN(Number(box_id))) {
      // Fetch the specific box and set it for editing
      FetchBoxById(Number(box_id));
    } else if (create_param === 'true') {
      setIsCreating(true);
    }
  }, [search_location]);

  // Fetch all boxes
  const { data: morph_boxes, isLoading: is_boxes_loading } = useQuery<MorphBox[]>({
    queryKey: ["/api/morphboxes"],
  });

  // Fetch specific box by ID
  const FetchBoxById = async (id: number) => {
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
  const delete_box_mutation = useMutation({
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

  const HandleCreateNewBox = () => {
    setEditingBox(null);
    setIsCreating(true);
    navigate("/my-boxes?create=true");
  };

  const HandleEditBox = (box: MorphBox) => {
    setEditingBox(box);
    setIsCreating(false);
    navigate(`/my-boxes?id=${box.id}`);
  };

  const HandleDeleteBox = (box: MorphBox) => {
    setBoxToDelete(box);
    setDeleteDialogOpen(true);
  };

  const ConfirmDeleteBox = () => {
    if (box_to_delete) {
      delete_box_mutation.mutate(Number(box_to_delete.id));
    }
  };

  const HandleCloseEditor = () => {
    setEditingBox(null);
    setIsCreating(false);
    navigate("/my-boxes");
  };

  const HandleBoxSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/morphboxes"] });
  };

  // Filter boxes based on search term and active tab
  const filtered_boxes = morph_boxes
    ? morph_boxes
      .filter(box =>
        search_term
          ? box.title.toLowerCase().includes(search_term.toLowerCase())
          : true
      )
      .filter(box => {
        if (active_tab === "all") return true;
        if (active_tab === "recent") {
          // Consider boxes from the last 7 days as recent
          const seven_days_ago = new Date();
          seven_days_ago.setDate(seven_days_ago.getDate() - 7);
          return new Date(box.updatedAt) >= seven_days_ago;
        }
        return false;
      })
    : [];

  // If editing or creating a box, show the morph box creator
  if (editing_box || is_creating) {
    return (
      <Layout title={editing_box ? `Editing: ${editing_box.title}` : "Create New Box"}>
        <div className="mb-4 flex items-center">
          <Button variant="outline" onClick={HandleCloseEditor}>
            &larr; Back to My Boxes
          </Button>
        </div>

        <MorphBoxCreator
          morphBoxId={editing_box ? Number(editing_box.id) : undefined}
          initialTitle={editing_box?.title || "New Morphological Box"}
          initialDescription={editing_box?.description || ""}
          onSaved={HandleBoxSaved}
        />
      </Layout>
    );
  }

  // Format the last saved time to a readable format
  const FormatLastSaved = (timestamp?: string) => {
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

  if (isLoading) {
    return <Layout title="My Boxes"><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  if (!user) {
    // Should be handled by ProtectedRoute, but good practice
    return <Layout title="My Boxes"><p>Please log in to view your boxes.</p></Layout>;
  }

  return (
    <Layout title="My Morphological Boxes">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">My Morphological Boxes</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Input
                placeholder="Search boxes..."
                value={search_term}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {search_term && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={HandleCreateNewBox}>
              <Plus className="h-4 w-4 mr-2" />
              New Box
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={active_tab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Boxes</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            {is_boxes_loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !filtered_boxes.length ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <Box className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {search_term ? "No Results Found" : "No Morphological Boxes"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  {search_term
                    ? "No boxes match your search. Try with different keywords."
                    : "You haven't created any morphological boxes yet. Create your first box to get started."}
                </p>
                {search_term ? (
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                ) : (
                  <Button onClick={HandleCreateNewBox}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Box
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered_boxes.map((box) => (
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
                            <DropdownMenuItem onClick={() => HandleEditBox(box)}>
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
                              onClick={() => HandleDeleteBox(box)}
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
                            Last edited: {FormatLastSaved(box.updatedAt.toString())}
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
                        onClick={() => HandleEditBox(box)}
                      >
                        Open
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => HandleDeleteBox(box)}
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
      <AlertDialog open={delete_dialog_open} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Morphological Box</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{box_to_delete?.title}"? This action cannot be undone
              and all data associated with this box will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={ConfirmDeleteBox}
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
