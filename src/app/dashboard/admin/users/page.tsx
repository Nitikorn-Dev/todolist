import { requireAdmin } from "@/lib/authorization/authorize";
import { getAllUsers } from "@/lib/admin/queries";
import { UserRoleForm } from "@/components/admin/UserRoleForm";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await getAllUsers();

  return (
    <main className="p-4 sm:p-8">
      <h1 className="text-2xl font-semibold">Admin: Users</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">Signed in as {admin.email}</p>

      {users.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No users yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-4 py-2 text-left font-medium">
                  Name
                </th>
                <th scope="col" className="px-4 py-2 text-left font-medium">
                  Email
                </th>
                <th scope="col" className="px-4 py-2 text-left font-medium">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    {user.id === admin.id ? (
                      <span>{user.role} (you)</span>
                    ) : (
                      <UserRoleForm userId={user.id} currentRole={user.role} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
