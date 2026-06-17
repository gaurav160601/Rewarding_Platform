const cartService =
require("../services/cart.service");

class CartController {

  async addItem(
    req,
    res,
    next
  ) {

    try {

      const result =
        await cartService.addItem(
          req.user.id,
          req.body
        );

      return res.status(201).json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

  async getCart(
    req,
    res,
    next
  ) {

    try {

      const result =
        await cartService.getCart(
          req.user.id
        );

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

  async updateItem(
    req,
    res,
    next
  ) {

    try {

      const result =
        await cartService.updateItem(
          req.user.id,
          Number(
            req.params.productId
          ),
          req.body.quantity
        );

      return res.json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

  async removeItem(
    req,
    res,
    next
  ) {

    try {

      const result =
        await cartService.removeItem(
          req.user.id,
          Number(
            req.params.productId
          )
        );

      return res.json({
        success: true,
        data: result
      });

    } catch (error) {

      next(error);

    }
  }

  async clearCart(
    req,
    res,
    next
  ) {

    try {

      const result =
        await cartService.clearCart(
          req.user.id
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
new CartController();