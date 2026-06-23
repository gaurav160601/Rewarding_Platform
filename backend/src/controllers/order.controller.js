const orderService =
require("../services/order.service");

class OrderController {

  async checkout(
    req,
    res,
    next
  ) {

    try {

      const result =
        await orderService.checkout(
          req.user.id,
          req.body.redeemPoints ||
            0
        );

      return res.status(201).json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

  async getMyOrders(
    req,
    res,
    next
  ) {

    try {

      const result =
        await orderService.getMyOrders(
          req.user.id,
          req.user.role
        );

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

  async getOrder(
    req,
    res,
    next
  ) {

    try {

      const result =
        await orderService.getOrder(
          req.params.id,
          req.user
        );

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

  async processOrder(
    req,
    res,
    next
  ) {

    try {

      const result =
        await orderService.processOrder(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

  async shipOrder(
    req,
    res,
    next
  ) {

    try {

      const result =
        await orderService.shipOrder(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

  async deliverOrder(
    req,
    res,
    next
  ) {

    try {

      const result =
        await orderService.deliverOrder(
          req.params.id
        );

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

  async cancelOrder(
    req,
    res,
    next
  ) {

    try {

      const result =
        await orderService.cancelOrder(
          req.params.id,
          req.user
        );

      return res.json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

}

module.exports =
new OrderController();
