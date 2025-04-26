import { User } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Pencil,
    Trash2,
    ShieldCheck,
    UserCog,
    User as UserIcon,
} from "lucide-react";

interface UserTableProps {
    users: User[];
    onEditUser: (user: User) => void;
    onDeleteUser: (user: User) => void;
}

// Helper to display role badges (copied from original component)
const renderRoleBadges = (user: User) => {
    const badges = [];
    if (user.isSuperAdmin) {
        badges.push(<Badge key="super" variant="destructive" className="mr-1">Super Admin</Badge>);
    }
    if (user.isTenantAdmin) {
        badges.push(<Badge key="tenant" className="bg-blue-600 hover:bg-blue-700 text-white mr-1"><ShieldCheck className="h-3 w-3 mr-1" /> Tenant Admin</Badge>);
    }
    if (user.isAdmin && !user.isSuperAdmin && !user.isTenantAdmin) {
        badges.push(<Badge key="admin" className="bg-primary mr-1"><UserCog className="h-3 w-3 mr-1" /> Admin</Badge>);
    }
    if (badges.length === 0) {
        badges.push(<Badge key="user" variant="outline"><UserIcon className="h-3 w-3 mr-1" /> User</Badge>);
    }
    return badges;
};

export function UserTable({ users, onEditUser, onDeleteUser }: UserTableProps) {
    return (
        <div className="overflow-x-auto border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role(s)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{renderRoleBadges(user)}</TableCell>
                            <TableCell>
                                <Badge variant={user.isActive ? "default" : "outline"}>
                                    {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEditUser(user)}
                                        title="Edit User"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit User</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => onDeleteUser(user)}
                                        title="Delete User"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete User</span>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
