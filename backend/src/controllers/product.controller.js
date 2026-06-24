const productService =
require("../services/product.service");

class ProductController {

  async create(
    req,
    res,
    next
  ) {

    try {

      const result =
        await productService.create(
          req.body
        );

      return res
        .status(201)
        .json({
          success: true,
          data: result
        });

    } catch (error) {

      next(error);

    }
  }

  async getAll(
    req,
    res,
    next
  ) {

    try {

      const page =
        Number(
          req.query.page || 1
        );

      const products =
        await productService.getAll(
          page
        );

      return res.json({
        success: true,
        data: products
      });

    } catch (error) {

      next(error);

    }
  }

  async getById(
    req,
    res,
    next
  ) {

    try {

      const product =
        await productService.getById(
          req.params.id
        );

      return res.json({
        success: true,
        data: product
      });

    } catch (error) {

      next(error);

    }
  }

  async search(
    req,
    res,
    next
  ) {

    try {

      const products =
        await productService.search(
          req.query.q
        );

      return res.json({
        success: true,
        data: products
      });

    } catch (error) {

      next(error);

    }
  }

  async update(
  req,
  res,
  next
) {

  try {

    const result =
      await productService.update(
        req.params.id,
        req.body
      );

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
}


async delete(
  req,
  res,
  next
) {

  try {

    const result =
      await productService.delete(
        req.params.id
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
new ProductController();
