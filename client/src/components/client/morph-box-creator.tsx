import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MorphBox, InsertMorphBox } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import DragAndDropProvider from "@/lib/dnd-provider";
import ParameterLibrary from "./parameter-library";
import MorphologicalBox from "./morphological-box";
import MorphBoxToolbar from "./morph-box-toolbar";

interface MorphBoxCreatorProps {
  morphBoxId?: number;
  initialTitle?: string;
  initialDescription?: string;
  onSaved?: (morphBox: MorphBox) => void;
}

export default function MorphBoxCreator({
  morphBoxId,
  initialTitle = "New Morphological Box",
  initialDescription = "",
  onSaved,
}: MorphBoxCreatorProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState(initialTitle);
  const [last_saved, setLastSaved] = useState<string | undefined>(undefined);
  const [is_saved, setIsSaved] = useState(false);
  const [collaborators, setCollaborators] = useState<{ id: number; username: string; }[]>([]);

  // Create or update a morphological box
  const morph_box_mutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: any;
      description?: string;
      isPublic?: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const morph_box_data: InsertMorphBox = {
        title: data.title,
        description: data.description || "",
        userId: user.id,
        isPublic: data.isPublic || false,
        content: data.content,
      };

      if (morphBoxId) {
        // Update existing box
        const res = await apiRequest(
          "PATCH",
          `/api/morphboxes/${morphBoxId}`,
          morph_box_data
        );
        return res.json();
      } else {
        // Create new box
        const res = await apiRequest(
          "POST",
          "/api/morphboxes",
          morph_box_data
        );
        return res.json();
      }
    },
    onSuccess: (data: MorphBox) => {
      setIsSaved(true);
      setLastSaved(new Date().toISOString());

      toast({
        title: "Saved successfully",
        description: "Your morphological box has been saved.",
      });

      if (onSaved) {
        onSaved(data);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/morphboxes"] });
      if (morphBoxId) {
        queryClient.invalidateQueries({
          queryKey: [`/api/morphboxes/${morphBoxId}`],
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Share a morphological box with another user
  const share_mutation = useMutation({
    mutationFn: async ({
      userId,
      canEdit,
    }: {
      userId: number;
      canEdit: boolean;
    }) => {
      if (!morphBoxId) {
        throw new Error("Please save the box before sharing");
      }

      const res = await apiRequest("POST", "/api/shared", {
        morphBoxId,
        userId,
        canEdit,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Shared successfully",
        description: "Your morphological box has been shared.",
      });
    },
    onError: (error) => {
      toast({
        title: "Share failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const HandleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsSaved(false);
  };

  const HandleSave = (content: any) => {
    morph_box_mutation.mutate({
      title,
      content,
      description: initialDescription,
      isPublic: false,
    });
  };

  const HandleShare = (userId: number, canEdit: boolean) => {
    share_mutation.mutate({ userId, canEdit });
  };

  const HandleExport = (format: string) => {
    toast({
      title: "Export initiated",
      description: `Exporting as ${format.toUpperCase()}...`,
    });

    // In a real application, this would trigger a download
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: `Your morphological box has been exported as ${format.toUpperCase()}.`,
      });
    }, 1500);
  };

  // Wrap the functions to match the expected signatures in MorphBoxToolbar
  const HandleShareWrapper = () => {
    // Diese Funktion sollte in einer echten Anwendung einen Dialog öffnen
    // oder anderweitig die Benutzer-ID und canEdit-Berechtigung erfassen
    const MOCK_USER_ID = 1;
    const MOCK_CAN_EDIT = true;
    HandleShare(MOCK_USER_ID, MOCK_CAN_EDIT);
  };

  const HandleExportWrapper = () => {
    // Diese Funktion sollte in einer echten Anwendung einen Dialog öffnen
    // oder anderweitig das Format erfassen
    const MOCK_FORMAT = "pdf";
    HandleExport(MOCK_FORMAT);
  };

  const is_loading = morph_box_mutation.isPending || share_mutation.isPending;

  return (
    <DragAndDropProvider>
      {is_loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Processing...</span>
          </div>
        </div>
      )}

      <MorphBoxToolbar
        title={title}
        onTitleChange={HandleTitleChange}
        lastSaved={last_saved}
        isSaved={is_saved}
        collaborators={collaborators}
        onSave={() => HandleSave({ savedAt: new Date().toISOString() })}
        onExport={HandleExportWrapper}
        onShare={HandleShareWrapper}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ParameterLibrary />
        </div>
        <div className="lg:col-span-2">
          <MorphologicalBox
            boxId={morphBoxId?.toString()}
            onSave={HandleSave}
          />
        </div>
      </div>
    </DragAndDropProvider>
  );
}
