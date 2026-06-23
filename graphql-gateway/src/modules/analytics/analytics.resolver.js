const analyticsService =
  require("../../services/analytics.service");

const analyticsResolver = {
  Query: {
    dashboardAnalytics:
      async (
        _,
        __,
        { token }
      ) => {
        return analyticsService.getDashboard(
          token
        );
      },
  },
};

module.exports = analyticsResolver;
