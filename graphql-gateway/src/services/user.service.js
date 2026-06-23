const {
  backendClient,
} = require("./backendClient");

class UserService {

  async getProfile(token) {

    const { data } =
      await backendClient.get(
        "/auth/profile",
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
  new UserService();
