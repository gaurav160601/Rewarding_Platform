const axios = require("axios");

const backendClient =
  axios.create({
    baseURL:
      process.env
        .BACKEND_API_URL,
  });

function setAuthToken(token) {
  if (token) {
    backendClient.defaults
      .headers.common[
      "Authorization"
    ] =
      `Bearer ${token}`;
  } else {
    delete backendClient
      .defaults.headers
      .common["Authorization"];
  }
}

module.exports = {
  backendClient,
  setAuthToken,
};
