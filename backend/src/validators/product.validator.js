const validateProduct = (data) => {

  const errors = [];

  if (data.name !== undefined && (!data.name || data.name.trim() === "")) {
    errors.push("Product name is required");
  }

  if (
    data.price !== undefined &&
    data.price <= 0
  ) {
    errors.push(
      "Price must be greater than 0"
    );
  }

  if (
    data.stock !== undefined &&
    data.stock < 0
  ) {
    errors.push(
      "Stock cannot be negative"
    );
  }

  if (data.sku !== undefined && (!data.sku || data.sku.trim() === "")) {
    errors.push("SKU is required");
  }

  if (data.name === undefined && data.price === undefined && data.stock === undefined && data.sku === undefined) {
    errors.push("No valid fields provided for update");
  }

  return errors;
};

module.exports = validateProduct;