import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../../classes/CalendarClass";
import { useQueryClient } from "@tanstack/react-query";



type AuthContextType = {
  user: User | null;
  token?: string | null;
  login: (data: { user: User}) => void;
  logout: () => void;
  isAuthReady: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(() => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  //Load from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsAuthReady(true);
  }, []);

  // Login
  const login = ({ user }: { user: User}) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};