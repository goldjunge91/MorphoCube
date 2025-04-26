import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Users } from "lucide-react";

// Wir definieren einen eigenen Benutzertyp, um Konflikte zu vermeiden
interface MorphoUser {
  id: string;
  username: string;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (userId: string, canEdit: boolean) => void;
}

export default function ShareDialog({
  open,
  onOpenChange,
  onShare,
}: ShareDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  const { data: users, isLoading } = useQuery<MorphoUser[]>({
    queryKey: ["/api/users"],
    enabled: open,
  });

  const handleShare = () => {
    if (selectedUserId) {
      onShare(selectedUserId, canEdit);
      onOpenChange(false);
      setSelectedUserId(null);
      setCanEdit(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Morphologischen Kasten teilen</DialogTitle>
          <DialogDescription>
            Teilen Sie Ihren morphologischen Kasten mit anderen Benutzern
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Benutzer zum Teilen auswählen</Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Benutzer werden geladen...</span>
              </div>
            ) : !users || users.length === 0 ? (
              <div className="text-center p-4 border rounded-md bg-gray-50">
                <Users className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Keine Benutzer zum Teilen verfügbar</p>
              </div>
            ) : (
              <Select
                value={selectedUserId || ""}
                onValueChange={(value) => setSelectedUserId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Benutzer auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-permission"
              checked={canEdit}
              onCheckedChange={(checked) => setCanEdit(checked as boolean)}
            />
            <Label htmlFor="edit-permission">Bearbeitung erlauben</Label>
          </div>

          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
            <p>
              Benutzer, mit denen Sie teilen, können Ihren morphologischen Kasten ansehen.
              Wenn Sie die Bearbeitung aktivieren, können sie auch Änderungen vornehmen.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleShare} disabled={!selectedUserId}>
            Teilen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
