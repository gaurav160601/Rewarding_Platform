const cartRepository =
  require("../repositories/cart.repository");

const productRepository =
  require("../repositories/product.repository");

const validateCart =
  require("../validators/cart.validators");

class CartService {

  async addItem(
    userId,
    data
  ) {

    const errors =
      validateCart(data);

    if (errors.length) {
      throw new Error(
        errors.join(", ")
      );
    }

    const {
      productId,
      quantity
    } = data;

    const product =
      await productRepository.getProductById(
        productId
      );

    if (!product) {
      throw new Error(
        "Product not found"
      );
    }

    if (
      product.status !== "ACTIVE"
    ) {
      throw new Error(
        "Product is not available"
      );
    }

    let cart =
      await cartRepository.findCartByUserId(
        userId
      );

    if (!cart) {

      const cartId =
        await cartRepository.createCart(
          userId
        );

      cart = {
        id: cartId
      };
    }

    const existingItem =
      await cartRepository.findCartItem(
        cart.id,
        productId
      );

    if (existingItem) {

      const newQuantity =
        existingItem.quantity +
        quantity;

      if (
        newQuantity > product.stock
      ) {
        throw new Error(
          "Insufficient stock"
        );
      }

      await cartRepository.updateQuantity(
        cart.id,
        productId,
        newQuantity
      );

      return {
        itemId:
          existingItem.id,
        message:
          "Item added to cart"
      };
    }

    if (
      quantity > product.stock
    ) {
      throw new Error(
        "Insufficient stock"
      );
    }

    const itemId =
      await cartRepository.addItem(
        cart.id,
        productId,
        quantity
      );

    return {
      itemId,
      message:
        "Item added to cart"
    };
  }

  async getCart(userId) {

    const cart =
      await cartRepository.findCartByUserId(
        userId
      );

    if (!cart) {

      return {
        items: [],
        total: 0
      };
    }

    const items =
      await cartRepository.getCartItems(
        cart.id
      );

    let total = 0;

    const cartItems =
      items.map(item => {

        const subtotal =
          Number(item.price) *
          item.quantity;

        total += subtotal;

        return {
          productId:
            item.product_id,

          name:
            item.name,

          price:
            Number(item.price),

          quantity:
            item.quantity,

          subtotal
        };
      });

    return {
      cartId: cart.id,
      items: cartItems,
      total
    };
  }

  async updateItem(
    userId,
    productId,
    quantity
  ) {

    if (
      !productId ||
      quantity === undefined ||
      quantity === null
    ) {
      throw new Error(
        "ProductId and quantity are required"
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        "Quantity must be a positive integer"
      );
    }

    const product =
      await productRepository.getProductById(
        productId
      );

    if (!product) {
      throw new Error(
        "Product not found"
      );
    }

    if (
      product.status !== "ACTIVE"
    ) {
      throw new Error(
        "Product is not available"
      );
    }

    if (
      quantity > product.stock
    ) {
      throw new Error(
        "Insufficient stock"
      );
    }

    const cart =
      await cartRepository.findCartByUserId(
        userId
      );

    if (!cart) {
      throw new Error(
        "Cart not found"
      );
    }

    const existingItem =
      await cartRepository.findCartItem(
        cart.id,
        productId
      );

    if (!existingItem) {
      throw new Error(
        "Item not found in cart"
      );
    }

    await cartRepository.updateQuantity(
      cart.id,
      productId,
      quantity
    );

    return {
      message:
        "Cart item updated"
    };
  }

  async removeItem(
    userId,
    productId
  ) {

    if (!productId) {
      throw new Error(
        "ProductId is required"
      );
    }

    const cart =
      await cartRepository.findCartByUserId(
        userId
      );

    if (!cart) {
      throw new Error(
        "Cart not found"
      );
    }

    const existingItem =
      await cartRepository.findCartItem(
        cart.id,
        productId
      );

    if (!existingItem) {
      throw new Error(
        "Item not found in cart"
      );
    }

    await cartRepository.removeItem(
      cart.id,
      productId
    );

    return {
      message:
        "Item removed from cart"
    };
  }

  async clearCart(userId) {

    const cart =
      await cartRepository.findCartByUserId(
        userId
      );

    if (!cart) {
      throw new Error(
        "Cart not found"
      );
    }

    await cartRepository.clearCart(
      cart.id
    );

    return {
      message:
        "Cart cleared successfully"
    };
  }
}

module.exports =
  new CartService();