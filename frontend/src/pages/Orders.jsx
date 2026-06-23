import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import graphqlClient from "../graphql/client";
import ORDERS_QUERY from "../graphql/orders.query";
import CANCEL_ORDER from "../graphql/orders.mutation";
import { useToast } from "../components/Toast";
import Modal from "../components/Modal";

function Orders() {
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await graphqlClient.post("", {
        query: ORDERS_QUERY,
      });
      const body = response.data;
      if (body.errors) {
        throw new Error(body.errors[0]?.message || "Failed to load orders");
      }
      setOrders(body.data.orders);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Failed to load orders");
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const retryPayment = async (orderId) => {
    try {
      const response = await api.post(`/payments/retry/${orderId}`);
      window.location.href = response.data.data.checkoutUrl;
    } catch (error) {
      toast(error.response?.data?.message || "Retry failed", "error");
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await graphqlClient.post("", {
        query: CANCEL_ORDER,
        variables: { orderId },
      });
      const body = response.data;
      if (body.errors) {
        throw new Error(body.errors[0]?.message || "Failed to cancel order");
      }
      toast(body.data.cancelOrder.message || "Order cancelled successfully", "success");
      fetchOrders();
    } catch (error) {
      toast(error.response?.data?.message || error.message || "Failed to cancel order", "error");
    }
  };

  const canCancel = (status) =>
    ["PAYMENT_PENDING", "PAID", "PROCESSING"].includes(status);

  if (loading) {
    return (
      <div>
        <h1 className="page-title">My Orders</h1>
        <div className="card">
          {[1, 2, 3].map((i) => (
            <div key={i} className="order-item" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="order-item-info" style={{ flex: 1 }}>
                <div className="skeleton-line skeleton-shimmer" style={{ width: "30%", height: 18 }} />
                <div className="skeleton-line skeleton-shimmer" style={{ width: "45%", height: 14, marginTop: 10 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div className="skeleton-line skeleton-shimmer" style={{ width: 80, height: 28, borderRadius: 20 }} />
                <div className="skeleton-line skeleton-shimmer" style={{ width: 90, height: 28 }} />
                <div className="skeleton-line skeleton-shimmer" style={{ width: 100, height: 28 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">My Orders</h1>
        <div className="empty-state">
          <div className="icon">📋</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="page-title">My Orders</h1>
        <div className="empty-state">
          <div className="icon">📋</div>
          <p>No orders found</p>
        </div>
      </div>
    );
  }

  const statusClass = (s) => s.toLowerCase().replace(/_/g, "_");

  return (
    <div>
      <h1 className="page-title">My Orders</h1>

      <div className="card">
        {orders.map((order) => (
          <div key={order.id} className="order-item">
            <div className="order-item-info">
              <p>Order #{order.id}</p>
              <p>₹{order.total_amount} &middot;{" "}
                {new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            <div className="order-item-actions">
              <span className={`badge badge-${statusClass(order.status)}`}>
                {order.status}
              </span>
              {Number(order.points_redeemed || 0) > 0 && (
                <span className="reward-badge">Reward Used</span>
              )}
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                View Details
              </button>
              {order.status === "PAYMENT_PENDING" && (
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => retryPayment(order.id)}
                >
                  Retry Payment
                </button>
              )}
              {canCancel(order.status) && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setCancelTarget(order)}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        visible={!!cancelTarget}
        title="Cancel Order"
        message={`Are you sure you want to cancel Order #${cancelTarget?.id}? This will refund any redeemed points and restore product stock.`}
        confirmLabel="Yes, Cancel Order"
        onConfirm={() => {
          const id = cancelTarget.id;
          setCancelTarget(null);
          cancelOrder(id);
        }}
        onCancel={() => setCancelTarget(null)}
        variant="danger"
      />
    </div>
  );
}

export default Orders;
