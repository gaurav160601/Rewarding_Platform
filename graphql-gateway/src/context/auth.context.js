const jwt = require("jsonwebtoken");

async function authContext({ req }) {
  const authHeader =
    req.headers.authorization || "";

  let user = null;
  let token = null;

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);

    try {
      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
    } catch {
      user = null;
    }
  }

  return {
    user,
    token,
  };
}

module.exports = authContext;
