import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({ baseURL: "/api" });

// Attach the JWT (read fresh from the store on every request, not captured
// once at module-load time) so it stays correct across login/logout.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 means the token is invalid/expired — clear auth and bounce to /auth
// rather than leaving the app stuck showing stale protected data.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== "/auth") {
        window.location.assign("/auth");
      }
    }
    return Promise.reject(error);
  }
);

export function errorMessage(err, fallback = "Something went wrong") {
  return err?.response?.data?.message || fallback;
}
