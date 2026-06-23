import { useState, useEffect } from "react";
import api from "../api/axios";

function Rewards() {

  const [balance, setBalance] =
    useState(0);

  const [transactions,
    setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {

    const fetchRewards =
      async () => {

        setLoading(true);
        setError(null);

        try {

          const [balanceRes,
            historyRes] =
            await Promise.all([
              api.get(
                "/rewards/balance"
              ),
              api.get(
                "/rewards/history"
              )
            ]);

          setBalance(
            balanceRes.data
              .data?.reward_points || 0
          );

          setTransactions(
            historyRes.data
              .data || []
          );

          setLoading(false);

        } catch (error) {

          setError(
            error.response?.data
              ?.message ||
            "Failed to load rewards"
          );

          setLoading(false);

        }

      };

    fetchRewards();

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
        <h1 className="page-title">Rewards</h1>
        <div className="empty-state">
          <div className="icon">⭐</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Rewards</h1>

      <div className="balance-card">
        <p className="label">Reward Balance</p>
        <p className="amount">{balance}</p>
        <p className="sub">Points</p>
      </div>

      <h2 className="section-title">History</h2>

      {transactions.length === 0
        ? (
          <div className="empty-state">
            <div className="icon">📄</div>
            <p>No reward transactions found</p>
          </div>
        )
        : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Points</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(
                  (txn) => (
                    <tr key={txn.id}>
                      <td style={{ color: txn.points > 0 ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                        {txn.points > 0 ? "+" : ""}{txn.points}
                      </td>
                      <td>
                        <span className={`badge badge-${txn.type.toLowerCase()}`}>
                          {txn.type}
                        </span>
                      </td>
                      <td>{txn.description}</td>
                      <td>
                        {new Date(txn.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
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

export default Rewards;
