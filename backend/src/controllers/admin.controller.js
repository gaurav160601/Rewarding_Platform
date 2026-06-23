const adminService =
  require("../services/admin.service");

class AdminController {

  async dashboard(
    req,
    res,
    next
  ) {

    try {

      const data =
        await adminService
          .getDashboard();

      return res.status(200).json({
        success: true,
        data
      });

    } catch (error) {

      next(error);

    }
  }

  async users(
    req,
    res,
    next
  ) {

    try {

      const data =
        await adminService
          .getUsers();

      return res.status(200).json({
        success: true,
        data
      });

    } catch (error) {

      next(error);

    }
  }

  async analytics(
    req,
    res,
    next
  ) {

    try {

      const data =
        await adminService
          .getAnalytics();

      return res.status(200).json({
        success: true,
        data
      });

    } catch (error) {

      next(error);

    }
  }
}

module.exports =
  new AdminController();
