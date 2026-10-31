import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "/api";

let memoryToken = localStorage.getItem("token");

const getStoredToken = () => {
  const currentToken = localStorage.getItem("token") || memoryToken;
  if (currentToken) {
    memoryToken = currentToken;
  }
  return currentToken;
};

export const setAccessToken = (token) => {
  memoryToken = token || null;
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

const parseTokenPayload = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1] || ""));
  } catch {
    return null;
  }
};

const isTokenExpired = (token, bufferSeconds = 30) => {
  if (!token) return true;
  const payload = parseTokenPayload(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000 - bufferSeconds * 1000;
};

let refreshPromise = null;

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((response) => {
        const { token, admin, sparkles } = response.data;
        setAccessToken(token);
        if (admin !== undefined) {
          localStorage.setItem("isAdmin", String(Number(admin) === 1));
        }
        if (sparkles !== undefined) {
          localStorage.setItem("isSparkles", String(Number(sparkles) === 1));
        }
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const requestUrl = config.url || "";
  const isAuthRequest =
    requestUrl.includes("/auth/login") ||
    requestUrl.includes("/auth/refresh") ||
    requestUrl.includes("/auth/register") ||
    requestUrl.includes("/auth/google");

  let token = memoryToken || getStoredToken();
  if (token) {
    memoryToken = token;
  }

  if (token && isTokenExpired(token) && !isAuthRequest) {
    try {
      token = await refreshAccessToken();
    } catch {
      setAccessToken(null);
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Session expired"));
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";
    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/google");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        const token = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
