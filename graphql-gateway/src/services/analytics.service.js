const {
  backendClient,
} = require("./backendClient");

class AnalyticsService {

  async getDashboard(token) {

    const headers = {
      Authorization:
        `Bearer ${token}`,
    };

    const [dashRes, analyticsRes] =
      await Promise.all([
        backendClient.get(
          "/admin/dashboard",
          { headers }
        ),
        backendClient.get(
          "/admin/analytics",
          { headers }
        ),
      ]);

    const dash =
      dashRes.data.data;

    const analytics =
      analyticsRes.data.data;

    const ordersByStatus =
      analytics.ordersByStatus
        ? Object.entries(
            analytics.ordersByStatus
          ).map(
            ([status, count]) => ({
              status,
              count,
            })
          )
        : [];

    return {
      ...dash,
      ordersByStatus,
      topProducts:
        analytics.topProducts ||
        [],
      recentOrders:
        analytics.recentOrders ||
        [],
    };
  }
}

module.exports =
  new AnalyticsService();
