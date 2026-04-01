import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // ✅ FETCH USERS
  useEffect(() => {
    fetch("/api/v1/users")
      .then(res => res.json())
      .then(data => {
        console.log("Users:", data);

        if (!data || data.length === 0) {
          setUsers([
            {
              id: 1,
              name: "John Doe",
              email: "john@example.com",
              role: "user",
              location: "Station A",
              joined: "2025-01-01"
            },
            {
              id: 2,
              name: "Admin User",
              email: "admin@example.com",
              role: "admin",
              location: "HQ",
              joined: "2024-12-01"
            }
          ]);
        } else {
          setUsers(data);
        }
      })
      .catch(() => {
        setUsers([]);
      });
  }, []);

  // ✅ UPDATE ROLE
  const handleRoleChange = async (id, newRole) => {
    const prevUsers = users;

    // optimistic UI
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, role: newRole } : u))
    );

    try {
      await fetch(`/api/v1/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: newRole })
      });

      toast.success("Role updated ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role ❌");
      setUsers(prevUsers); // rollback
    }
  };

  // ✅ SEARCH FILTER
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
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
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>

                {/* ✅ ROLE DROPDOWN */}
                <td className="p-2">
                  <select
                    value={user.role}
                    onChange={e =>
                      handleRoleChange(user.id, e.target.value)
                    }
                    className="text-black p-1 rounded"
                  >
                    <option value="user">User</option>
                    <option value="authority">Authority</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td className="p-2">{user.location}</td>
                <td className="p-2">{user.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}