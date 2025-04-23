import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  XCircle,
  Clock,
  Share2,
  Eye,
  Pencil,
  Loader2,
} from "lucide-react";
import { MorphBox } from "@shared/schema";

export default function SharedPage() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch shared boxes
  const { data: sharedBoxes, isLoading } = useQuery<MorphBox[]>({
    queryKey: ["/api/morphboxes/shared"],
  });

  const handleViewBox = (boxId: number) => {
    navigate(`/my-boxes?id=${boxId}`);
  };

  // Filter boxes based on search term
  const filteredBoxes = sharedBoxes
    ? sharedBoxes.filter(box => 
        searchTerm 
          ? box.title.toLowerCase().includes(searchTerm.toLowerCase())
          : true
      )
    : [];

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
    <Layout title="Shared with me">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Shared with me</h1>
          <div className="relative w-full sm:w-auto">
            <Input
              placeholder="Search shared boxes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
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
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !filteredBoxes.length ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <Share2 className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No Results Found" : "No Shared Boxes"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              {searchTerm
                ? "No shared boxes match your search. Try with different keywords."
                : "No one has shared any morphological boxes with you yet."}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
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
                    {/* Access level badge */}
                    <Badge variant={box.canEdit ? "default" : "outline"}>
                      {box.canEdit ? (
                        <Pencil className="h-3 w-3 mr-1" />
                      ) : (
                        <Eye className="h-3 w-3 mr-1" />
                      )}
                      {box.canEdit ? "Can Edit" : "View Only"}
                    </Badge>
                  </div>
                  <CardDescription>
                    <div className="flex items-center mt-2">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>
                          {box.owner?.username?.slice(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        Shared by {box.owner?.username || "Unknown user"}
                      </span>
                    </div>
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
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => handleViewBox(box.id)}
                  >
                    {box.canEdit ? "Edit Box" : "View Box"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
