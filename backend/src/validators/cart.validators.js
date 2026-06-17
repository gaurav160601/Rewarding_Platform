const validateCart = (data) => {

  const errors = [];

  if (
    data.productId === undefined ||
    data.productId === null
  ) {
    errors.push(
      "ProductId is required"
    );
  }

  if (
    data.quantity === undefined ||
    data.quantity === null
  ) {
    errors.push(
      "Quantity is required"
    );
  } else if (
    !Number.isInteger(data.quantity)
  ) {
    errors.push(
      "Quantity must be an integer"
    );
  } else if (
    data.quantity <= 0
  ) {
    errors.push(
      "Quantity must be greater than 0"
    );
  }

  return errors;
};

module.exports = validateCart;
