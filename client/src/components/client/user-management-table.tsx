import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter, // Keep DialogFooter for structure
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2, UserPlus, Search, XCircle } from "lucide-react";
import { UserTable } from "./user-table"; // Import UserTable
import { UserForm, UserFormValues } from "./user-form"; // Import UserForm and its type

// Define props for the component
interface UserManagementTableProps {
  tenantId?: string; // Optional tenantId to filter users
}

// User form schema (can be defined here or imported from user-form)
const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  isAdmin: z.boolean().default(false),
  isTenantAdmin: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// Type for update payload (excluding password hash, including optional password)
type UpdateUserPayload = Omit<Partial<User>, 'passwordHash' | 'id' | 'createdAt' | 'updatedAt' | 'tenantId'> & {
  password?: string; // Include optional password for updates
};

export default function UserManagementTable({ tenantId }: UserManagementTableProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // --- Data Fetching and Mutations (remain in the main component) ---
  const queryKey = tenantId ? ["/api/admin/tenants", tenantId, "users"] : ["/api/users"];
  const queryFn = async () => {
    const endpoint = tenantId ? `/api/admin/tenants/${tenantId}/users` : "/api/users";
    const res = await apiRequest("GET", endpoint);
    return res.json();
  };

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: queryKey,
    queryFn: queryFn,
  });

  const createForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "", email: "", password: "", isAdmin: false, isTenantAdmin: false, isActive: true,
    },
  });

  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema.extend({
      password: z.string().optional().or(z.literal("")),
    })),
    defaultValues: {
      username: "", email: "", password: "", isAdmin: false, isTenantAdmin: false, isActive: true,
    },
  });

  useEffect(() => {
    if (selectedUser) {
      editForm.reset({
        username: selectedUser.username,
        email: selectedUser.email,
        password: "",
        isAdmin: selectedUser.isAdmin,
        isTenantAdmin: selectedUser.isTenantAdmin,
        isActive: selectedUser.isActive,
      });
    } else {
      editForm.reset();
    }
  }, [selectedUser, editForm]);

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const payload: any = { ...data };
      if (tenantId) payload.tenantId = tenantId;
      const res = await apiRequest("POST", "/api/users", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      setCreateDialogOpen(false);
      createForm.reset();
      toast({ title: "User created", description: "New user created successfully." });
    },
    onError: (error: any) => {
      toast({ title: "User creation failed", description: error?.message || "Unknown error.", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserPayload; }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      setEditDialogOpen(false);
      setSelectedUser(null);
      toast({ title: "User updated", description: "User updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "User update failed", description: error?.message || "Unknown error.", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      toast({ title: "User deleted", description: "User deleted successfully." });
    },
    onError: (error: any) => {
      toast({ title: "User deletion failed", description: error?.message || "Unknown error.", variant: "destructive" });
    },
  });

  // --- Event Handlers ---
  const onCreateSubmit = (data: UserFormValues) => {
    const payload = { ...data };
    if (!payload.password) {
      toast({ title: "Password required", description: "Password is required.", variant: "destructive" });
      return;
    }
    createUserMutation.mutate(payload);
  };

  const onEditSubmit = (data: UserFormValues) => {
    if (!selectedUser) return;
    const updateData: UpdateUserPayload = {
      username: data.username, email: data.email, isAdmin: data.isAdmin,
      isTenantAdmin: data.isTenantAdmin, isActive: data.isActive,
    };
    if (data.password && data.password.length > 0) {
      updateData.password = data.password;
    }
    updateUserMutation.mutate({ id: selectedUser.id, data: updateData });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  // --- Filtering ---
  const filteredUsers = searchTerm && users
    ? users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : users;

  // --- Render Logic ---
  return (
    <>
      <div className="bg-background rounded-lg shadow-sm border p-4 mb-6">
        {/* Header with Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-xl font-semibold">
            {tenantId ? "Tenant User Management" : "User Management"}
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!filteredUsers || filteredUsers.length === 0) && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-4">
              {searchTerm
                ? "No users match your search criteria."
                : "No users found."}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* User Table */}
        {!isLoading && filteredUsers && filteredUsers.length > 0 && (
          <UserTable
            users={filteredUsers}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </div>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user {tenantId ? "to this tenant" : "to the system"}.
            </DialogDescription>
          </DialogHeader>
          {/* Use UserForm component */}
          <UserForm
            form={createForm}
            onSubmit={onCreateSubmit}
            onCancel={() => setCreateDialogOpen(false)}
            isSubmitting={createUserMutation.isPending}
            submitButtonText="Create User"
            isEditMode={false}
          />
          {/* DialogFooter is now part of UserForm */}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
            <DialogDescription>
              Update user information. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          {/* Use UserForm component */}
          <UserForm
            form={editForm}
            onSubmit={onEditSubmit}
            onCancel={() => setEditDialogOpen(false)}
            isSubmitting={updateUserMutation.isPending}
            submitButtonText="Save Changes"
            isEditMode={true}
          />
          {/* DialogFooter is now part of UserForm */}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user{" "}
              <span className="font-medium">{selectedUser?.username}</span>
              {" "}and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={deleteUserMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}