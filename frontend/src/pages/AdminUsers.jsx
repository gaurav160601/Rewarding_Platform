import { useState, useEffect }
  from "react";
import api from "../api/axios";

function AdminUsers() {

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {

    const fetchUsers =
      async () => {

        setLoading(true);
        setError(null);

        try {

          const response =
            await api.get(
              "/admin/users"
            );

          setUsers(
            response.data.data
          );

          setLoading(false);

        } catch (error) {

          setError(
            error.response?.data
              ?.message ||
            "Failed to load users"
          );

          setLoading(false);

        }

      };

    fetchUsers();

  }, []);

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">
          Admin Users
        </h1>
        <div className="empty-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">
        Admin Users
      </h1>

      {users.length === 0 ? (
        <div className="empty-state">
          <p>No users found</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.id}
                  </td>
                  <td>
                    {user.email}
                  </td>
                  <td>
                    <span
                      className={`badge badge-${user.role.toLowerCase()}`}
                    >
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
