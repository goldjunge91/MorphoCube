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
import { User } from "@shared/schema";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (userId: number, canEdit: boolean) => void;
}

export default function ShareDialog({
  open,
  onOpenChange,
  onShare,
}: ShareDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
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
          <DialogTitle>Share Morphological Box</DialogTitle>
          <DialogDescription>
            Share your morphological box with other users
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">Select user to share with</Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading users...</span>
              </div>
            ) : !users || users.length === 0 ? (
              <div className="text-center p-4 border rounded-md bg-gray-50">
                <Users className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No users available to share with</p>
              </div>
            ) : (
              <Select
                value={selectedUserId?.toString() || ""}
                onValueChange={(value) => setSelectedUserId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
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
            <Label htmlFor="edit-permission">Allow editing</Label>
          </div>

          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
            <p>
              Users you share with will be able to view your morphological box.
              If you enable editing, they will also be able to make changes to it.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={!selectedUserId}>
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
