const {
  backendClient,
} = require("./backendClient");

class RewardService {

  async getBalance(token) {

    const { data } =
      await backendClient.get(
        "/rewards/balance",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return data.data;
  }

  async getHistory(token) {

    const { data } =
      await backendClient.get(
        "/rewards/history",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return data.data;
  }

  async redeem(points, token) {

    const { data } =
      await backendClient.post(
        "/rewards/redeem",
        { points },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return data.data;
  }
}

module.exports =
  new RewardService();
