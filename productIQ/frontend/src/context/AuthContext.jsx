import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, getCurrentUser } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("productiq_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("productiq_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("productiq_token");
      if (storedToken) {
        try {
          const data = await getCurrentUser();
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem("productiq_user", JSON.stringify(data.user));
          }
        } catch (error) {
          console.warn("Session expired or invalid, logging out:", error.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin({ email, password });
    if (data?.token && data?.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("productiq_token", data.token);
      localStorage.setItem("productiq_user", JSON.stringify(data.user));
      return data.user;
    }
    throw new Error("Invalid response from server");
  };

  const register = async (name, email, password, role) => {
    const data = await apiRegister({ name, email, password, role });
    if (data?.token && data?.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("productiq_token", data.token);
      localStorage.setItem("productiq_user", JSON.stringify(data.user));
      return data.user;
    }
    throw new Error("Registration failed");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("productiq_token");
    localStorage.removeItem("productiq_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
