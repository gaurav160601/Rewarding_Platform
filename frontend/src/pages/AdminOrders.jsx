import { useState, useEffect } from "react";
import api from "../api/axios";
import { useToast } from "../components/Toast";
import { TableSkeleton } from "../components/Skeleton";

function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/orders");
      setOrders(response.data.data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load orders");
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, action) => {
    try {
      await api.put(`/orders/${id}/${action}`);
      toast(`Order #${id} ${action}ed successfully`, "success");
      fetchOrders();
    } catch (error) {
      toast(error.response?.data?.message || "Operation failed", "error");
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Admin Orders</h1>
        <TableSkeleton rows={5} cols={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">Admin Orders</h1>
        <div className="empty-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const statusClass = (s) => s.toLowerCase().replace(/_/g, "_");

  return (
    <div>
      <h1 className="page-title">Admin Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders found</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.user_id}</td>
                  <td>₹{order.total_amount}</td>
                  <td>
                    <span className={`badge badge-${statusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                  <td>
                    {order.status === "PAID" && (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => updateStatus(order.id, "process")}
                        >
                          Process
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => updateStatus(order.id, "cancel")}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {order.status === "PAYMENT_PENDING" && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => updateStatus(order.id, "cancel")}
                      >
                        Cancel
                      </button>
                    )}

                    {order.status === "PROCESSING" && (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(order.id, "ship")}
                        >
                          Ship
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => updateStatus(order.id, "cancel")}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {order.status === "SHIPPED" && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => updateStatus(order.id, "deliver")}
                      >
                        Deliver
                      </button>
                    )}
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

export default AdminOrders;
