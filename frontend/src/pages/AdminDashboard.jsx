import { useState, useEffect }
  from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import graphqlClient from "../graphql/client";
import ANALYTICS_QUERY from "../graphql/analytics.query";

const STATUS_COLORS = {
  PAID: "#16a34a",
  PAYMENT_PENDING: "#f59e0b",
  PROCESSING: "#2563eb",
  SHIPPED: "#9333ea",
  DELIVERED: "#0891b2",
  CANCELLED: "#dc2626"
};

function AdminDashboard() {

  const [dashboard, setDashboard] =
    useState(null);

  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {

    const fetchData =
      async () => {

        setLoading(true);
        setError(null);

        try {

          const response =
            await graphqlClient.post(
              "",
              {
                query: ANALYTICS_QUERY,
              }
            );

          const body = response.data;

          if (body.errors) {
            throw new Error(
              body.errors[0]
                ?.message ||
              "Failed to load dashboard"
            );
          }

          const data =
            body.data
              .dashboardAnalytics;

          setDashboard(data);
          setAnalytics(data);

          setLoading(false);

        } catch (error) {

          setError(
            error.response?.data
              ?.message ||
            error.message ||
            "Failed to load dashboard"
          );

          setLoading(false);

        }

      };

    fetchData();

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
          Admin Dashboard
        </h1>
        <div
          className="empty-state"
        >
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const pieData = Array.isArray(
    analytics?.ordersByStatus
  )
    ? analytics.ordersByStatus.map(
        ({ status, count }) => ({
          name: status,
          value: count,
        })
      )
    : [];

  const barData = analytics
    ?.topProducts
    ? analytics.topProducts.map(
        (p) => ({
          name:
            p.name.length > 15
              ? p.name.slice(0, 15) +
                "..."
              : p.name,
          Sales: p.sales
        })
      )
    : [];

  return (
    <div>
      <h1 className="page-title">
        Admin Dashboard
      </h1>

      <h2 className="section-title">
        Overview
      </h2>

      <div className="stat-row">
        {[
          {
            label: "Total Users",
            value:
              dashboard.totalUsers
          },
          {
            label: "Total Products",
            value:
              dashboard.totalProducts
          },
          {
            label: "Total Orders",
            value:
              dashboard.totalOrders
          },
          {
            label: "Total Revenue",
            value: `₹${dashboard.totalRevenue}`
          },
          {
            label:
              "Reward Transactions",
            value:
              dashboard
                .totalRewardTransactions
          }
        ].map((stat) => (
          <div
            key={stat.label}
            className="card card-stat"
          >
            <h3>{stat.label}</h3>
            <p className="value">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <h2 className="section-title">
            Orders By Status
          </h2>

          {pieData.length > 0 ? (
            <div className="card">
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map(
                      (entry) => (
                        <Cell
                          key={
                            entry.name
                          }
                          fill={
                            STATUS_COLORS[
                              entry
                                .name
                            ] || "#999"
                          }
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <p>
                No orders found
              </p>
            </div>
          )}
        </div>

        <div className="chart-box">
          <h2 className="section-title">
            Top Products
          </h2>

          {barData.length > 0 ? (
            <div className="card">
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart
                  data={barData}
                  margin={{
                    top: 5,
                    right: 20,
                    left: 0,
                    bottom: 60
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="Sales"
                    fill="#2563eb"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state">
              <p>
                No product sales yet
              </p>
            </div>
          )}
        </div>
      </div>

      <h2 className="section-title">
        Recent Orders
      </h2>

      {analytics?.recentOrders &&
      analytics.recentOrders
        .length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentOrders
                .map((order) => (
                  <tr key={order.id}>
                    <td>
                      #{order.id}
                    </td>
                    <td>
                      {order.user_id}
                    </td>
                    <td>
                      <span
                        className={`badge badge-${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      ₹
                      {order.total_amount}
                    </td>
                    <td>
                      {new Date(
                        order.created_at
                      ).toLocaleString(
                        "en-IN",
                        {
                          day:
                            "numeric",
                          month:
                            "short",
                          year:
                            "numeric",
                          hour:
                            "2-digit",
                          minute:
                            "2-digit"
                        }
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>No recent orders</p>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
