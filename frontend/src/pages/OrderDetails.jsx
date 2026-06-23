import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import graphqlClient from "../graphql/client";
import ORDER_DETAILS_QUERY from "../graphql/orderDetails.query";

function getTimelineSteps(order) {
  const status = order.status;

  const steps = [
    {
      label: "Order Created",
      key: "created",
      completed: true,
      date: order.created_at
    },
  ];

  if (status === "CANCELLED") {
    steps.push({
      label: "Cancelled",
      key: "cancelled",
      completed: false,
      cancelled: true,
      date: order.cancelled_at
    });
    return steps;
  }

  if (status === "PAYMENT_EXPIRED") {
    steps.push({
      label: "Payment Expired",
      key: "expired",
      completed: false,
      cancelled: true,
    });
    return steps;
  }

  steps.push({
    label: "Payment Completed",
    key: "paid",
    completed:
      status === "PAYMENT_PENDING"
        ? false
        : status === "PAID" ||
          status === "PROCESSING" ||
          status === "SHIPPED" ||
          status === "DELIVERED",
    date: order.paid_at,
  });

  steps.push({
    label: "Processing",
    key: "processing",
    completed:
      status === "PROCESSING" ||
      status === "SHIPPED" ||
      status === "DELIVERED",
    date: order.processed_at,
  });

  steps.push({
    label: "Shipped",
    key: "shipped",
    completed:
      status === "SHIPPED" || status === "DELIVERED",
    date: order.shipped_at,
  });

  steps.push({
    label: "Delivered",
    key: "delivered",
    completed: status === "DELIVERED",
    date: order.delivered_at,
  });

  return steps;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const day = d.getDate();
  const mon = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${mon} ${year} ${hours}:${mins}`;
}

function OrderDetails() {

  const { id } = useParams();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {

    const fetchOrder =
      async () => {

        setLoading(true);
        setError(null);

        try {

          const response =
            await graphqlClient.post(
              "",
              {
                query:
                  ORDER_DETAILS_QUERY,
                variables: {
                  id: Number(id),
                },
              }
            );

          const body = response.data;

          if (body.errors) {
            throw new Error(
              body.errors[0]
                ?.message ||
              "Failed to load order"
            );
          }

          setOrder(body.data.order);

          setLoading(false);

        } catch (error) {

          setError(
            error.response?.data
              ?.message ||
            error.message ||
            "Failed to load order"
          );

          setLoading(false);

        }

      };

    fetchOrder();

  }, [id]);

  const statusClass = (s) =>
    s.toLowerCase().replace(/_/g, "_");

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
        <h1 className="page-title">Order Details</h1>
        <div className="empty-state">
          <div className="icon">📋</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <h1 className="page-title">Order Details</h1>
        <div className="empty-state">
          <div className="icon">📋</div>
          <p>Order not found</p>
        </div>
      </div>
    );
  }

  const pointsRedeemed =
    Number(
      order.points_redeemed || 0
    );

  const discountAmount =
    Number(
      order.discount_amount || 0
    );

  const finalAmount =
    Number(order.total_amount) -
    discountAmount;

  const timelineSteps =
    getTimelineSteps(order);

  return (
    <div>
      <h1 className="page-title">Order #{order.id}</h1>

      <div className="card mb-24">
        <div className="order-status-row">
          <div className="field">
            <p className="label">Status</p>
            <span className={`badge badge-${statusClass(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="field">
            <p className="label">Date</p>
            <p className="value">
              {new Date(order.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      </div>

      <h2 className="section-title">Order Timeline</h2>

      <div className="card mb-24">
        <div className="timeline">
          {timelineSteps.map(
            (step, idx) => (
              <div
                className="timeline-item"
                key={step.key}
              >
                <div className="timeline-line">
                  <div
                    className={`timeline-dot ${
                      step.cancelled
                        ? "cancelled"
                        : step.completed
                        ? "completed"
                        : "pending"
                    }`}
                  />
                  {idx <
                    timelineSteps.length -
                      1 && (
                    <div
                      className={`timeline-connector ${
                        step.completed &&
                        !step.cancelled
                          ? "completed"
                          : ""
                      }`}
                    />
                  )}
                </div>
                <div className="timeline-content">
                  <div
                    className={`timeline-label ${
                      !step.completed &&
                      !step.cancelled
                        ? "pending-label"
                        : ""
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.date && (
                    <div className="timeline-date">
                      {formatDate(step.date)}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <h2 className="section-title">Payment Summary</h2>

      <div className="card mb-24">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{order.total_amount}</span>
        </div>

        {pointsRedeemed > 0 && (
          <>
            <div className="summary-row summary-points">
              <span>Points Redeemed</span>
              <span>{pointsRedeemed} Points</span>
            </div>
            <div className="summary-row summary-discount">
              <span>Reward Discount</span>
              <span>-₹{discountAmount}</span>
            </div>
          </>
        )}

        <div className="summary-total">
          <span>Final Paid</span>
          <span>₹{finalAmount < 0 ? 0 : finalAmount}</span>
        </div>
      </div>

      {pointsRedeemed > 0 && order.status !== "CANCELLED" && (
        <div className="reward-banner">
          <span>🎉</span>
          <span>Reward Discount Applied</span>
        </div>
      )}

      {order.status === "CANCELLED" && (pointsRedeemed > 0 || order.paid_at) && (
        <>
          <h2 className="section-title">Reward Adjustments</h2>
          <div className="card mb-24">
            {pointsRedeemed > 0 && (
              <div className="summary-row">
                <span>Redeemed Points Returned</span>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>+{pointsRedeemed}</span>
              </div>
            )}
            {order.paid_at && finalAmount > 0 && (
              <div className="summary-row">
                <span>Earned Points Reversed</span>
                <span style={{ color: "#dc2626", fontWeight: 600 }}>
                  -{Math.floor(finalAmount / 10)}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      <h2 className="section-title">Items</h2>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map(
              (item) => (
                <tr key={item.id}>
                  <td>{item.product_name || item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.product_price}</td>
                  <td>₹{item.subtotal}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OrderDetails;
