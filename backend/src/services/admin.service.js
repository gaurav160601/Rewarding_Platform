const adminRepository =
  require("../repositories/admin.repository");

class AdminService {

  async getDashboard() {

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      totalRewardTransactions
    ] = await Promise.all([
      adminRepository
        .getTotalUsers(),
      adminRepository
        .getTotalProducts(),
      adminRepository
        .getTotalOrders(),
      adminRepository
        .getTotalRevenue(),
      adminRepository
        .getTotalRewardTransactions()
    ]);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      totalRewardTransactions
    };
  }

  async getUsers() {

    return adminRepository
      .getAllUsers();
  }

  async getAnalytics() {

    const [
      ordersByStatus,
      topProducts,
      recentOrders
    ] = await Promise.all([
      adminRepository
        .getOrdersByStatus(),
      adminRepository
        .getTopProducts(),
      adminRepository
        .getRecentOrders()
    ]);

    return {
      ordersByStatus,
      topProducts,
      recentOrders
    };
  }
}

module.exports =
  new AdminService();
