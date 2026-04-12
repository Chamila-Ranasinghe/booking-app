import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../../classes/CalendarClass";




type AuthContextType = {
  user: User | null;
  token?: string | null;
  login: (data: { user: User;}) => void;
  logout: () => void;
  isAuthReady: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
//   const [token, setToken] = useState<string | null>(null);

  //Load from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    // const storedToken = localStorage.getItem("token");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    //   setToken(storedToken);
    }
    setIsAuthReady(true);
  }, []);

  // Login
  const login = ({ user }: { user: User; }) => {
    setUser(user);
    // setToken(token);

    localStorage.setItem("user", JSON.stringify(user));
    // localStorage.setItem("token", token);
  };

  // Logout
  const logout = () => {
    setUser(null);
    // setToken(null);

    localStorage.removeItem("user");
    // localStorage.removeItem("token");
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