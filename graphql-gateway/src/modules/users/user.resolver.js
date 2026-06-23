const userService =
  require("../../services/user.service");

const userResolver = {
  Query: {
    profile:
      async (
        _,
        __,
        { token }
      ) => {
        return userService.getProfile(
          token
        );
      },
  },
};

module.exports = userResolver;
