import axios from "axios";

let memoryToken = null;

export const setAccessToken = (token) => {
  memoryToken = token;
};

const api = axios.create({
  baseURL: "http://localhost:3001",
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Request a new access token. The browser automatically attaches the HttpOnly cookie.
        const response = await axios.post(
          "http://localhost:3001/auth/refresh",
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
