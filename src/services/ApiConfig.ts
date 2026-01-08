// src/api/api.js
import axios from "axios";
import Helpers from "../utils/Helpers";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Interceptor for request
apiClient.interceptors.request.use(
  (config: any) => {
    const token = Helpers.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for response
apiClient.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    if (error.message == "timeout of 20000ms exceeded") {
      return;
    }
    if (error.config.url == "/auth/verify") {
      return Promise.reject(error);
    }
    // Check if token is expired and hasn't tried to refresh token
    // if (error.response.status === 401 && !originalRequest._retry) {
    //     originalRequest._retry = true;

    //     try {
    //         // Call Refresh Token Api
    //         const refreshToken = Helpers.getRefreshToken();

    //         const refreshResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}gesys/auth/refresh`, { refresh_token: refreshToken });

    //         if (refreshResponse.status === 200) {
    //             // Store New Access Token
    //             const newAccessToken = refreshResponse.data.data.access_token;
    //             const newRefreshToken = refreshResponse.data.data.refresh_token;
    //             Helpers.storeAccessToken(newAccessToken);
    //             Helpers.storeRefreshToken(newRefreshToken);

    //             // Update Authorization header
    //             originalRequest.headers['Authorization'] = `BEARER ${newAccessToken}`;
    //             apiClient.defaults.headers["Authorization"] = `BEARER ${newAccessToken}`;

    //             return apiClient(originalRequest);
    //         }
    //     } catch (refreshError) {
    //         Helpers.clearToken();
    //         Helpers.removeUserInfo();
    //         Helpers.redirect('/')
    //     }
    // }
    return Promise.reject(error);
  }
);
export { apiClient };
