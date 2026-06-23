const {
  backendClient,
} = require("./backendClient");

class ProductService {

  async getAll(token) {

    const { data } =
      await backendClient.get(
        "/products",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return data.data;
  }

  async getById(id, token) {

    const { data } =
      await backendClient.get(
        `/products/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return data.data;
  }

  async create(input, token) {

    const payload = {
      ...input,
      sku:
        input.sku ||
        `GQL-${Date.now()}`,
    };

    const { data: res } =
      await backendClient.post(
        "/products",
        payload,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    const { productId } =
      res.data;

    return this.getById(
      productId,
      token
    );
  }

  async update(id, input, token) {

    const { data } =
      await backendClient.put(
        `/products/${id}`,
        input,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return data.data;
  }

  async delete(id, token) {

    const { data } =
      await backendClient.delete(
        `/products/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return data;
  }
}

module.exports =
  new ProductService();
