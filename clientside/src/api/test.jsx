
// the quick fix to refesh token. Keep LocalStorage, Add Refresh Token

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json"
  }
});

// 1. Inject the short-lived access token into every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token"); // This is your access token
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// 2. Intercept 401 errors to automatically refresh the token
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the server says 401 (Expired) and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        // Call your backend refresh endpoint
        const response = await axios.post("http://localhost:3001/auth/refresh", {
          refreshToken: refreshToken
        });

        const { token, newRefreshToken } = response.data;

        // Save the new tokens back to local storage
        localStorage.setItem("token", token);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Retry the original network request with the new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return API(originalRequest);
      } catch (refreshError) {
        // Both tokens are dead, clear everything and kick user to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
