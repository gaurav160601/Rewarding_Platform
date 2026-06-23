const {
  backendClient,
} = require("./backendClient");

class OrderService {

  async getAll(token) {

    const { data } =
      await backendClient.get(
        "/orders",
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
        `/orders/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return data.data;
  }

  async cancel(id, token) {

    const { data } =
      await backendClient.put(
        `/orders/${id}/cancel`,
        {},
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
  new OrderService();
