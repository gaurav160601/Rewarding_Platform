import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const STATUS_BADGE = {
  PENDING: "badge-pending",
  SUCCESS: "badge-earn",
  FAILED: "badge-cancelled",
  REFUNDED: "badge-redeem",
};

const TYPE_BADGE = {
  PAYMENT: "badge-earn",
  REFUND: "badge-redeem",
  PARTIAL_REFUND: "badge-pending",
};

function PaymentHistory() {

  const [payments,
    setPayments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {

    const fetchPayments =
      async () => {

        setLoading(true);
        setError(null);

        try {

          const res =
            await api.get(
              "/payments/history"
            );

          setPayments(
            res.data.data || []
          );

          setLoading(false);

        } catch (error) {

          setError(
            error.response?.data
              ?.message ||
            "Failed to load payment history"
          );

          setLoading(false);

        }

      };

    fetchPayments();

  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="page-title">
          Payment History
        </h1>
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="page-title">
          Payment History
        </h1>
        <div className="empty-state">
          <div className="icon">💳</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">
        Payment History
      </h1>

      {payments.length === 0
        ? (
          <div className="empty-state">
            <div className="icon">💳</div>
            <p>
              No payments found.{" "}
              <Link to="/products">
                Start shopping
              </Link>
            </p>
          </div>
        )
        : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(
                  (p) => (
                    <tr key={p.id}>
                      <td>
                        {new Date(
                          p.created_at
                        ).toLocaleString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      <td>
                        <Link
                          to={`/orders/${p.order_id}`}
                          className="table-link"
                        >
                          #{p.order_id}
                        </Link>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            TYPE_BADGE[
                              p.type || "PAYMENT"
                            ] ||
                            "badge-pending"
                          }`}
                        >
                          {p.type || "PAYMENT"}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: p.type === "REFUND" ? "#16a34a" : undefined }}>
                        {p.type === "REFUND" ? "+" : ""}₹{Number(
                          p.type === "REFUND"
                            ? p.refund_amount || p.amount
                            : p.amount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            STATUS_BADGE[
                              p.status
                            ] ||
                            "badge-pending"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}

export default PaymentHistory;
