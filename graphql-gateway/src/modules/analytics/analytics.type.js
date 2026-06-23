const gql =
  require("graphql-tag");

const AnalyticsType = gql`
  scalar JSON

  type TopProduct {
    id: Int
    name: String
    sales: String
  }

  type RecentOrder {
    id: Int
    user_id: Int
    status: String
    total_amount: Float
    created_at: String
  }

  type OrderStatusStat {
    status: String
    count: Int
  }

  type DashboardStats {
    totalUsers: Int
    totalProducts: Int
    totalOrders: Int
    totalRevenue: Float
    totalRewardTransactions: Int
    ordersByStatus: [OrderStatusStat]
    topProducts: [TopProduct]
    recentOrders: [RecentOrder]
  }
`;

module.exports = AnalyticsType;
