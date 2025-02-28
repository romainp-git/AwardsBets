import React, { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser, getToken } from "../api";

// 📌 Variable globale pour `logout()`
let globalLogout: (() => void) | null = null;

// 📌 Fonction pour enregistrer `logout()`
export const setGlobalLogout = (logoutFn: () => void) => {
  globalLogout = logoutFn;
};

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await getToken();
      setIsAuthenticated(!!storedToken);
    };
    checkToken();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      await loginUser(username, password);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    console.log("🚀 Déconnexion déclenchée !");
    await logoutUser();
    setIsAuthenticated(false);
  };

  // 📌 Enregistrer `logout()` globalement pour `api.ts`
  useEffect(() => {
    setGlobalLogout(logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
};

// 📌 Exporter `globalLogout` pour `api.ts`
export { globalLogout };
