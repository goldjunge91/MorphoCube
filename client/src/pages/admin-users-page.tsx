import Layout from "@/components/client/layout";

export default function AdminUsersPage() {
  // TODO: Implement global user management (view all users across tenants) for Super Admins
  return (
    <Layout title="Global User Management">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Global User Management</h1>
        {/* Placeholder content */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">Global user list and management tools (Super Admin only).</p>
          {/* Add user table and management actions */}
        </div>
      </div>
    </Layout>
  );
}
