import { useAuth } from "@/hooks/use-auth";
import { useLocation, useParams } from "wouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/client/layout";
import UserManagementTable from "@/components/client/user-management-table"; // Reuse the table component
import { Loader2, Building2 } from "lucide-react";
import { Tenant } from "@shared/schema"; // Import Tenant type

export default function TenantUsersPage() {
    const { user } = useAuth();
    const [, navigate] = useLocation();
    const params = useParams<{ tenantId?: string; }>(); // Get tenantId from route params
    const tenantId = params.tenantId; // Get tenantId from URL

    useEffect(() => {
        // Redirect non-super-admins away
        if (user && !user.isSuperAdmin) {
            navigate("/");
        }
        // Redirect if tenantId is missing
        if (!tenantId) {
            console.error("Tenant ID missing from URL");
            navigate("/admin/tenants"); // Or show an error
        }
    }, [user, navigate, tenantId]);

    // Fetch tenant details
    const { data: tenant, isLoading: isLoadingTenant } = useQuery<Tenant>({
        queryKey: ["tenant", tenantId],
        queryFn: async () => {
            const res = await fetch(`/api/admin/tenants/${tenantId}`, { // Assuming this endpoint exists
                credentials: "include",
            });
            if (!res.ok) {
                throw new Error(`Failed to fetch tenant details for ID: ${tenantId}`);
            }
            return await res.json();
        },
        enabled: !!user?.isSuperAdmin && !!tenantId,
    });

    if (!user || !user.isSuperAdmin) {
        return <div>Redirecting...</div>; // Will redirect via useEffect
    }

    if (isLoadingTenant) {
        return (
            <Layout title="Loading Tenant Users...">
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (!tenant) {
        return (
            <Layout title="Error">
                <div className="text-center py-12 text-destructive">
                    Tenant not found or access denied.
                </div>
            </Layout>
        );
    }

    return (
        <Layout title={`Users for ${tenant.name}`}>
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                    <h1 className="text-2xl font-bold">
                        User Management for Tenant: {tenant.name} ({tenant.slug})
                    </h1>
                </div>
                {/* Pass tenantId to the table to filter users */}
                <UserManagementTable tenantId={tenantId} />
            </div>
        </Layout>
    );
}
