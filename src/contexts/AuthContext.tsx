import React, { createContext, useState, useContext } from "react";
import Helpers from "../utils/Helpers";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logOut: () => void;
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(Helpers.isLoggedIn());
  const [loading, setLoading] = useState(false);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logOut = () => {
    Helpers.removeUserInfo();
    Helpers.clearToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logOut,
        isAuthenticated,
        loading,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
