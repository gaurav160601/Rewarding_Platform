import axios from "axios";

const graphqlClient = axios.create({
  baseURL: import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/graphql",
  headers: {
    "Content-Type": "application/json",
  },
});

graphqlClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

graphqlClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default graphqlClient;
