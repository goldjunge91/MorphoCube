import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Layout from "@/components/layout";
import UserManagementTable from "@/components/user-management-table";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect non-admin users away from this page
    if (user && !user.isAdmin) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user || !user.isAdmin) {
    return <div>Redirecting...</div>; // Will redirect via useEffect
  }

  return (
    <Layout title="User Management">
      <UserManagementTable />
    </Layout>
  );
}
