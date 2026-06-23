const gql =
  require("graphql-tag");

const AnalyticsQuery = gql`
  extend type Query {
    dashboardAnalytics: DashboardStats
  }
`;

module.exports = AnalyticsQuery;
