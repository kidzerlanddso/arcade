import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://rototuna-alumni-platform.onrender.com"
    : "http://localhost:3001");

let memoryToken = localStorage.getItem("token");

export const setAccessToken = (token) => {
  memoryToken = token;
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial: Tells the browser to send/receive cookies automatically
});

api.interceptors.request.use((req) => {
  if (memoryToken) {
    req.headers.Authorization = `Bearer ${memoryToken}`;
  }
  return req;
});

// Seamlessly handle token refresh on 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const requestUrl = originalRequest?.url || "";
    const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        // Request a new access token. The browser automatically attaches the HttpOnly cookie.
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { token } = response.data;
        setAccessToken(token);

        // Update the failed request header and immediately retry it
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Both tokens are missing or invalid; wipe memory and kick to login
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
