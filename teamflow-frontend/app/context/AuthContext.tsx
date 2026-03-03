"use client";
import { createContext, useState, useContext, ReactNode } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored) as User;
      if (!parsed?.token) {
        localStorage.removeItem("user");
        return null;
      }
      return parsed;
    } catch (error) {
      console.error("Invalid JSON in localStorage:", error);
      localStorage.removeItem("user");
      return null;
    }
  });

  const login = (userData: User) => {
    if (typeof window !== 'undefined') {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};