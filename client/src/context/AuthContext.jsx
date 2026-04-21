import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import api, { registerUnauthorizedHandler, tokenStorageKey } from "../api/client";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pushToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionExpiredRef = useRef(false);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      localStorage.removeItem(tokenStorageKey);
      setUser(null);

      if (!sessionExpiredRef.current) {
        pushToast({
          tone: "error",
          title: "Session expired",
          message: "Your sign-in has expired. Please sign in again to continue working.",
        });
      }

      sessionExpiredRef.current = true;

      if (location.pathname !== "/login") {
        navigate("/login", { replace: true, state: { from: location.pathname } });
      }
    });

    return () => {
      registerUnauthorizedHandler(null);
    };
  }, [location.pathname, navigate, pushToast]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(tokenStorageKey);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
        sessionExpiredRef.current = false;
      } catch (error) {
        localStorage.removeItem(tokenStorageKey);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem(tokenStorageKey, data.token);
    setUser(data.user);
    sessionExpiredRef.current = false;
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem(tokenStorageKey, data.token);
    setUser(data.user);
    sessionExpiredRef.current = false;
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(tokenStorageKey);
    setUser(null);
    sessionExpiredRef.current = false;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
