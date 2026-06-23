import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const STATUS_BADGE = {
  PENDING: "badge-pending",
  SUCCESS: "badge-earn",
  FAILED: "badge-cancelled",
  REFUNDED: "badge-redeem",
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
                  <th>Payment ID</th>
                  <th>Order ID</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(
                  (p) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td>
                        <Link
                          to={`/orders/${p.order_id}`}
                          className="table-link"
                        >
                          #{p.order_id}
                        </Link>
                      </td>
                      <td>
                        ₹{Number(
                          p.amount
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
                      <td>
                        <span className="badge badge-processing">
                          {p.order_status}
                        </span>
                      </td>
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
