import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/client/layout"; // Assuming a generic layout exists
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
import { Loader2, Box, Search, Globe, Clock, XCircle, Copy } from "lucide-react";
import { MorphBox } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function PublicBoxesPage() {
    const [, navigate] = useLocation();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch public boxes
    const { data: publicBoxes = [], isLoading } = useQuery<MorphBox[]>({
        queryKey: ["/api/morphboxes/public"],
    });

    const handleViewBox = (boxId: number) => {
        // Navigate to a read-only view or the editor if cloning is intended
        // For now, let's assume it opens the standard editor page
        navigate(`/my-boxes?id=${boxId}`);
        // Potentially add a query param like `&view=public` if needed
    };

    const handleCloneBox = (boxId: number) => {
        // TODO: Implement cloning functionality
        // This would likely involve:
        // 1. Fetching the full box data.
        // 2. Creating a new box with the fetched data under the current user's account.
        // 3. Navigating to the newly created box's edit page.
        toast({
            title: "Clone (Not Implemented)",
            description: `Cloning box ID ${boxId} is not yet implemented.`,
            variant: "default",
        });
    };

    // Format the last saved time
    const formatLastSaved = (timestamp?: string | Date) => {
        if (!timestamp) return "Never";
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
        return date.toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Filter boxes based on search term
    const filteredBoxes = publicBoxes.filter(box =>
        searchTerm
            ? box.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (box.description && box.description.toLowerCase().includes(searchTerm.toLowerCase()))
            : true
    );

    return (
        // Using a generic Layout, adjust if a specific public layout is needed
        <Layout title="Public Boxes">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold">Public Morphological Boxes</h1>
                    <div className="relative flex-1 sm:flex-initial w-full sm:w-64">
                        <Input
                            placeholder="Search public boxes..."
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
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !filteredBoxes.length ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                            <Globe className="h-6 w-6 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? "No Results Found" : "No Public Boxes Available"}
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-4">
                            {searchTerm
                                ? "No public boxes match your search criteria."
                                : "There are currently no publicly shared morphological boxes."}
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
                                    <CardTitle className="truncate">{box.title}</CardTitle>
                                    <CardDescription>
                                        <div className="flex items-center text-gray-500 mt-1">
                                            <Clock className="h-3 w-3 mr-1" />
                                            <span className="text-xs">
                                                Last updated: {formatLastSaved(box.updatedAt)}
                                            </span>
                                            {/* TODO: Add author info if available */}
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
                                        onClick={() => handleViewBox(box.id)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleCloneBox(box.id)}
                                    >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Clone
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
