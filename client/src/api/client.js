import axios from "axios";

export const tokenStorageKey = "smart-restaurant-token";

const isLocalApiUrl = (value = "") => /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//i.test(String(value).trim());

const resolveBaseUrl = () => {
  if (typeof window === "undefined") {
    return import.meta.env.VITE_API_BASE_URL || "/api";
  }

  const { hostname, port } = window.location;
  const configuredBaseUrl = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  const runningLocally = hostname === "127.0.0.1" || hostname === "localhost";

  if (configuredBaseUrl) {
    if (!runningLocally && isLocalApiUrl(configuredBaseUrl)) {
      return "/api";
    }

    return configuredBaseUrl;
  }

  if (runningLocally) {
    if (port === "4173" || port === "5173") {
      return `http://${hostname}:8080/api`;
    }
  }

  return "/api";
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenStorageKey);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
