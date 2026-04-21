import axios from "axios";

export const tokenStorageKey = "smart-restaurant-token";

const resolveBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (typeof window === "undefined") {
    return "/api";
  }

  const { hostname, port } = window.location;

  if (hostname === "127.0.0.1" || hostname === "localhost") {
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
