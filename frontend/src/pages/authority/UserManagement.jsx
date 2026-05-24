import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// ✅ Auth header helper — outside component to avoid recreating on every render
const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ FETCH USERS
  useEffect(() => {
    setLoading(true);

    fetch("/users?skip=0&limit=100", { headers: authHeaders() })
      .then(res => {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          setUsers([]);
          toast("No users found");
        } else {
          setUsers(data);
        }
      })
      .catch(() => {
        toast.error("Failed to load users ❌");
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ UPDATE ROLE
  const handleRoleChange = async (id, newRole) => {
    const prevUsers = users;

    // Optimistic UI update
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, role: newRole } : u))
    );

    try {
      const res = await fetch(`/users/${id}/role`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ role: newRole }),
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!res.ok) throw new Error(res.status); // triggers rollback

      toast.success("Role updated ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role ❌");
      setUsers(prevUsers); // rollback on failure
    }
  };

  // ✅ SEARCH FILTER — safe with optional chaining
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 border rounded mt-6">
      <h2 className="text-xl font-semibold mb-4 text-white">
        User Management (Admin)
      </h2>

      {/* 🔍 SEARCH */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 p-2 w-full rounded border"
      />
      

      {/* TABLE */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-6">Loading users...</p>
        ) : (
          <table className="w-full text-left text-white border">
            <thead className="bg-white/20">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Location</th>
                <th className="p-2">Joined</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="border-t">
                    <td className="p-2">{user.name ?? "—"}</td>
                    <td className="p-2">{user.email ?? "—"}</td>

                    {/* ✅ ROLE DROPDOWN — values match backend allowed_roles */}
                    <td className="p-2">
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                        className="text-black p-1 rounded"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="ngo">NGO</option>
                        <option value="authority">Authority</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="p-2">{user.location ?? "—"}</td>
                    <td className="p-2">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}