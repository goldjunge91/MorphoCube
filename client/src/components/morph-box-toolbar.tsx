import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Save,
  Share2,
  Download,
  ChevronDown,
  Clock,
  CheckCircle,
  Pencil,
} from "lucide-react";
import ShareDialog from "./share-dialog";
import ExportDialog from "./export-dialog";

interface MorphBoxToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  lastSaved?: string;
  isSaved?: boolean;
  collaborators?: { id: number; username: string }[];
  onSave: () => void; // Changed prop type
  onExport: (format: string) => void;
  onShare: (userId: number, canEdit: boolean) => void;
}

export default function MorphBoxToolbar({
  title,
  onTitleChange,
  lastSaved,
  isSaved = true,
  collaborators = [],
  onSave, // Use the prop directly
  onExport,
  onShare,
}: MorphBoxToolbarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      title,
    },
  });

  const startEditing = () => {
    setIsEditing(true);
  };

  const handleSubmitTitle = (data: { title: string }) => {
    onTitleChange(data.title);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setValue("title", title);
    setIsEditing(false);
  };

  // Removed the internal handleSave function and its DOM querying logic.
  // The onSave prop passed from the parent component handles the actual save logic.

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
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center mb-2 sm:mb-0">
          {isEditing ? (
            <form onSubmit={handleSubmit(handleSubmitTitle)} className="flex">
              <Input
                {...register("title", { required: true })}
                className="text-xl font-semibold border-0 border-b-2 border-primary focus:ring-0 py-1 px-0"
                autoFocus
              />
              <div className="flex space-x-1 ml-2">
                <Button size="sm" type="submit" variant="ghost">
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="sm" type="button" variant="ghost" onClick={cancelEditing}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center">
              <h2 className="text-xl font-semibold">{title}</h2>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-gray-400 hover:text-gray-700"
                onClick={startEditing}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            <span>Share</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
          >
            <Download className="h-4 w-4 mr-2" />
            <span>Export</span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>

          <Button size="sm" onClick={onSave}> {/* Updated onClick to call prop directly */}
            <Save className="h-4 w-4 mr-2" />
            <span>Save</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center mt-4 -mx-2">
        <div className="px-2 mb-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last edited: {formatLastSaved(lastSaved)}
          </Badge>
        </div>

        {isSaved && (
          <div className="px-2 mb-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Saved
            </Badge>
          </div>
        )}

        {collaborators.length > 0 && (
          <div className="px-2 mb-2 ml-auto">
            <div className="flex -space-x-2">
              {collaborators.slice(0, 3).map((user) => (
                <Avatar key={user.id} className="h-6 w-6 border-2 border-white">
                  <AvatarFallback>
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {collaborators.length > 3 && (
                <div className="h-6 w-6 rounded-full border-2 border-white bg-gray-200 text-gray-700 text-xs flex items-center justify-center">
                  +{collaborators.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        onShare={onShare}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={onExport}
      />
    </div>
  );
}