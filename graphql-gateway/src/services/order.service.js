const {
  backendClient,
} = require("./backendClient");

class OrderService {

  async getAll(token) {

    console.log(
      "[OrderService] token length:",
      token?.length
    );

    console.log(
      "[OrderService] endpoint:",
      `${backendClient.defaults.baseURL}/orders`
    );

    try {
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

    } catch (error) {

      console.error(
        "[OrderService] Status:",
        error.response?.status,
        "Body:",
        JSON.stringify(
          error.response?.data
        )
      );

      throw error;
    }
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
