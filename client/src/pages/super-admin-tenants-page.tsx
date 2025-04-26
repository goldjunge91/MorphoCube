// Datei: /client/src/pages/super-admin-tenants-page.tsx

import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/client/layout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { insertTenantSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Building2,
    Check,
    Edit,
    Loader2,
    Lock,
    Plus,
    Shield,
    Unlock,
    Users,
    X
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tenant } from "@shared/schema"; // Import Tenant type

// Form-Schema für neuen Tenant
const newTenantSchema = insertTenantSchema.extend({
    adminEmail: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
    adminUsername: z.string().min(3, "Benutzername muss mindestens 3 Zeichen haben"),
    adminPassword: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
});

type NewTenantFormValues = z.infer<typeof newTenantSchema>;

export default function SuperAdminTenantsPage() {
    const { user } = useAuth();
    const [, navigate] = useLocation();
    const { toast } = useToast();
    const [isNewTenantDialogOpen, setIsNewTenantDialogOpen] = useState(false);

    useEffect(() => {
        // Nur Super-Admins dürfen zugreifen
        if (user && !user.isSuperAdmin) {
            navigate("/");
        }
    }, [user, navigate]);

    // Alle Tenants laden
    const { data: tenants = [], isLoading: isLoadingTenants, refetch } = useQuery<Tenant[]>({
        queryKey: ["tenants"],
        queryFn: async () => {
            const res = await fetch("/api/admin/tenants", {
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Fehler beim Laden der Tenants");
            }

            const data = await res.json();
            return data; // Assuming API returns Tenant[]
        },
        enabled: !!user?.isSuperAdmin,
    });

    // Tenant-Status ändern (aktiv/inaktiv)
    const toggleTenantStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean; }) => {
            const res = await apiRequest("PATCH", `/api/admin/tenants/${id}/status`, { isActive });
            return await res.json();
        },
        onSuccess: () => {
            refetch();
            toast({
                title: "Status geändert",
                description: "Der Tenant-Status wurde erfolgreich aktualisiert.",
            });
        },
    });

    // Neuen Tenant erstellen
    const createTenantMutation = useMutation({
        mutationFn: async (data: NewTenantFormValues) => {
            const res = await apiRequest("POST", "/api/admin/tenants", data);
            return await res.json();
        },
        onSuccess: () => {
            refetch();
            setIsNewTenantDialogOpen(false);
            toast({
                title: "Tenant erstellt",
                description: "Der neue Tenant wurde erfolgreich erstellt.",
            });
        },
    });

    // Form für neuen Tenant
    const newTenantForm = useForm<NewTenantFormValues>({
        resolver: zodResolver(newTenantSchema),
        defaultValues: {
            name: "",
            slug: "",
            plan: "free",
            maxUsers: 5,
            adminEmail: "",
            adminUsername: "",
            adminPassword: "",
        },
    });

    const onNewTenantSubmit = (data: NewTenantFormValues) => {
        createTenantMutation.mutate(data);
    };

    if (!user || !user.isSuperAdmin) {
        return <div>Redirecting...</div>; // Wird durch useEffect weitergeleitet
    }

    return (
        <Layout title="Tenant Management">
            <div className="container mx-auto py-8">
                <h1 className="text-2xl font-bold mb-6">Tenant Management</h1>
                {/* Placeholder content */}
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600">Tenant list and management tools (Super Admin only).</p>
                    {/* Add tenant table, create button, and management actions */}
                </div>
            </div>
        </Layout>
    );
}