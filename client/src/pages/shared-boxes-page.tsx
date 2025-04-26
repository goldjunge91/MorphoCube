import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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
import { Input } from "@/components/ui/input";
import { Loader2, Box, Search, Share2, Clock, XCircle } from "lucide-react";
import { MorphBox } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function SharedBoxesPage() {
    const [, navigate] = useLocation();
    const { user, isLoading } = useAuth();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch boxes shared with the user
    const { data: sharedBoxes = [] } = useQuery<MorphBox[]>({
        queryKey: ["/api/morphboxes/shared"],
        enabled: !!user, // Only fetch if user is logged in
    });

    const handleOpenBox = (boxId: number) => {
        // Navigate to the box editor/viewer page
        // Assuming the editor page handles shared boxes correctly
        navigate(`/my-boxes?id=${boxId}`);
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
    const filteredBoxes = sharedBoxes.filter(box =>
        searchTerm
            ? box.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (box.description && box.description.toLowerCase().includes(searchTerm.toLowerCase()))
            : true
    );

    if (isLoading) {
        return <Layout title="Shared With Me"><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
    }

    if (!user) {
        return <Layout title="Shared With Me"><p>Please log in to view shared boxes.</p></Layout>;
    }

    return (
        <Layout title="Shared With Me">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold">Shared With Me</h1>
                    <div className="relative flex-1 sm:flex-initial w-full sm:w-64">
                        <Input
                            placeholder="Search shared boxes..."
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

                {!filteredBoxes.length ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                            <Share2 className="h-6 w-6 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? "No Results Found" : "No Boxes Shared With You"}
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-4">
                            {searchTerm
                                ? "No shared boxes match your search criteria."
                                : "Currently, no morphological boxes have been shared with you."}
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
                                                Last edited: {formatLastSaved(box.updatedAt)}
                                            </span>
                                            {/* TODO: Add shared by user info if available */}
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
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleOpenBox(box.id)}
                                    >
                                        Open
                                    </Button>
                                    {/* Add other actions like 'Remove from shared' if applicable */}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
