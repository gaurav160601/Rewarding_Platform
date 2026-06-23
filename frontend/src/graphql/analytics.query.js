const ANALYTICS_QUERY = `
  query AdminDashboard {
    dashboardAnalytics {
      totalUsers
      totalProducts
      totalOrders
      totalRevenue
      totalRewardTransactions
      ordersByStatus {
        status
        count
      }
      topProducts {
        id
        name
        sales
      }
      recentOrders {
        id
        user_id
        status
        total_amount
        created_at
      }
    }
  }
`;

export default ANALYTICS_QUERY;
